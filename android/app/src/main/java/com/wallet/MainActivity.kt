package com.wallet

import android.content.ComponentName
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.nfc.cardemulation.CardEmulation
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import ch.procivis.one.core.nfc.EngagementService
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.concurrentReactEnabled
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {
    companion object {
        private const val TAG = "MainActivity"
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String? {
        return "Wallet"
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. Here we use a util class [ ] which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            mainComponentName!!,  // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            fabricEnabled,  // fabricEnabled
            // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
            concurrentReactEnabled // concurrentRootEnabled
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme_procivis)
        super.onCreate(null)
        mCardEmulation = getCardEmulationInstance()
    }

    // hide content while in background
    override fun onResume() {
        super.onResume()
        window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
        try {
            mCardEmulation?.setPreferredService(
                this,
                ComponentName(this, EngagementService::class.java)
            )
        } catch (error: Throwable) {
            Log.wtf(TAG, "setPreferredService failed: $error")
        }
    }

    override fun onPause() {
        super.onPause()
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        try {
            mCardEmulation?.unsetPreferredService(this)
        } catch (error: Throwable) {
            Log.wtf(TAG, "unsetPreferredService failed: $error")
        }
    }

    private var mCardEmulation: CardEmulation? = null;
    private fun getCardEmulationInstance(): CardEmulation? {
        if (!packageManager.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)) {
            return null
        }
        val nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        if (nfcAdapter == null) {
            return null
        }
        return CardEmulation.getInstance(nfcAdapter)
    }
}
