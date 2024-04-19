package com.wallet;

import android.app.Activity;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.io.FileNotFoundException;
import java.io.OutputStream;
import java.io.InputStream;

public class FileExporterModule extends ReactContextBaseJavaModule {
  private static final String NAME = "FileExporter";
  private static final int FILE_EXPORT_REQUEST_CODE = 12;

  private static final String E_ACTIVITY_DOES_NOT_EXIST = "ACTIVITY_DOES_NOT_EXIST";
  private static final String E_FILE_PARAMETER_MISSING = "FILE_PARAMETER_MISSING";
  private static final String E_FAILED_TO_SHOW_PICKER = "FAILED_TO_SHOW_PICKER";
  private static final String E_DOCUMENT_EXPORT_CANCELED = "DOCUMENT_EXPORT_CANCELED";
  private static final String E_UNKNOWN_ACTIVITY_RESULT = "UNKNOWN_ACTIVITY_RESULT";
  private static final String E_COULD_NOT_OPEN_FILE = "COULD_NOT_OPEN_FILE";
  private static final String E_COULD_NOT_COPY_FILE = "COULD_NOT_COPY_FILE";
  private static final String E_UNEXPECTED_EXCEPTION = "UNEXPECTED_EXCEPTION";

  private static final String OPTION_TYPE = "type";

  private static final String FIELD_URI = "url";
  private static final String FIELD_NAME = "filename";
  private static final String FIELD_TYPE = "mimeType";
  private Promise promise;
  private Uri fileUri;
  private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
      if (requestCode == FILE_EXPORT_REQUEST_CODE) {
        if (promise != null) {
          onShowActivityResult(resultCode, data, promise);
          promise = null;
        }
      }
    }
  };

  public FileExporterModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(activityEventListener);
  }

  @Override
  public void onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy();
    getReactApplicationContext().removeActivityEventListener(activityEventListener);
  }

  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void export(ReadableMap args, Promise promise) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Current activity does not exist");
      return;
    }

    this.promise = promise;

    try {
      if (args.hasKey(FIELD_URI) && args.getString(FIELD_URI) != null) {
        this.fileUri = Uri.parse(args.getString(FIELD_URI));
      } else {
        this.promise.reject(E_FILE_PARAMETER_MISSING, "uri property is missing");
        this.promise = null;
        return;
      }

      Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
      intent.addCategory(Intent.CATEGORY_OPENABLE);

      intent.setType("*/*");
      if (args.hasKey(FIELD_TYPE) && args.getString(FIELD_TYPE) != null) {
        intent.setType(args.getString(FIELD_TYPE));
      }
      if (args.hasKey(FIELD_NAME) && args.getString(FIELD_NAME) != null) {
        intent.putExtra(Intent.EXTRA_TITLE, args.getString(FIELD_NAME));
      }

      currentActivity.startActivityForResult(intent, FILE_EXPORT_REQUEST_CODE, Bundle.EMPTY);
    } catch (Exception e) {
      e.printStackTrace();
      this.promise.reject(E_FAILED_TO_SHOW_PICKER, e.getLocalizedMessage());
      this.promise = null;
      this.fileUri = null;
    }
  }

  public void onShowActivityResult(int resultCode, Intent data, Promise promise) {
    if (resultCode == Activity.RESULT_CANCELED) {
      promise.reject(E_DOCUMENT_EXPORT_CANCELED, "User canceled document export");
    } else if (resultCode == Activity.RESULT_OK) {
      Uri uri = null;

      if (data == null) {
        promise.reject(E_COULD_NOT_OPEN_FILE, "Could not open output file");
        return;
      }

      uri = data.getData();
      try {
        Context context = getReactApplicationContext();
        OutputStream os = context.getContentResolver().openOutputStream(uri);
        InputStream is = context.getContentResolver().openInputStream(this.fileUri);
        if (os == null || is == null) {
          promise.reject(E_COULD_NOT_OPEN_FILE, "Could not open input or output file");
          this.promise = null;
          this.fileUri = null;
          return;
        }
        boolean success = this.copyStream(is, os);
        if (!success) {
          promise.reject(E_COULD_NOT_COPY_FILE, "Could not copy file");
          this.promise = null;
          this.fileUri = null;
          return;
        }

        promise.resolve(Arguments.createMap());
      } catch (FileNotFoundException e) {
        promise.reject(E_COULD_NOT_OPEN_FILE, "Could not open output file", e);
      } catch (Exception e) {
        promise.reject(E_UNEXPECTED_EXCEPTION, e.getLocalizedMessage(), e);
      }
    } else {
      promise.reject(E_UNKNOWN_ACTIVITY_RESULT, "Unknown activity result: " + resultCode);
    }
    this.promise = null;
    this.fileUri = null;
  }

  private boolean copyStream(InputStream is, OutputStream os) {
    final int buffer_size = 4096;
    try {
      byte[] bytes = new byte[buffer_size];
      for (int count = 0, prog = 0; count != -1; ) {
        count = is.read(bytes);
        if (count != -1) {
          os.write(bytes, 0, count);
        }
      }
      os.flush();
      is.close();
      os.close();
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
