import {
  reportError,
  reportException,
} from '@procivis/one-react-native-components';
import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

import { Sha256 } from '../../utils/sha256';
import {
  loadString as loadStringFromAsyncStorage,
  remove as removeFromAsyncStorage,
} from '../../utils/storage';
import {
  loadString,
  remove,
  saveString,
} from '../../utils/storage/secureStorage';

export const PIN_CODE_LENGTH = 6;
const STORAGE_KEY = 'pin-code-sha256';

async function migratePinCodeToSafeStorage(): Promise<string | null> {
  const oldPinCode = await loadStringFromAsyncStorage(STORAGE_KEY);
  if (oldPinCode) {
    saveString(STORAGE_KEY, oldPinCode);
    await removeFromAsyncStorage(STORAGE_KEY);
  }
  return oldPinCode;
}

async function loadPinCode(): Promise<string | null> {
  return loadString(STORAGE_KEY).then(async (pinCode) => {
    if (pinCode === null) {
      pinCode = await migratePinCodeToSafeStorage();
    }
    return pinCode;
  });
}

// emitted when pin code initialized
const PIN_CODE_INITIALIZATION_EVENT = 'pin-code-initialization';
let globalPinInitialized: boolean | undefined;
export function useOnPinCodeInitialized(
  callback: (initialized: boolean) => void,
) {
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      PIN_CODE_INITIALIZATION_EVENT,
      () => callback(globalPinInitialized!),
    );
    return () => subscription.remove();
  }, [callback]);
}

export function storePin(userEntry: string): void {
  saveString(STORAGE_KEY, userEntry)
    .then((successful) => {
      if (!successful) {
        reportError("Couldn't store PIN");
      } else {
        globalPinInitialized = true;
        DeviceEventEmitter.emit(PIN_CODE_INITIALIZATION_EVENT);
      }
    })
    .catch((e) => {
      reportException(e, "Couldn't store PIN");
    });
}

export async function removePin(): Promise<void> {
  return remove(STORAGE_KEY).then(() => {
    globalPinInitialized = false;
    DeviceEventEmitter.emit(PIN_CODE_INITIALIZATION_EVENT);
  });
}

export const usePinCodeEntry = (onPinEntered: (userEntry: string) => void) => {
  const [userEntry, setUserEntry] = useState<string>('');

  const onPressDigit = useCallback((digit: number) => {
    setUserEntry((curr) => `${curr}${digit}`);
  }, []);

  const onPressDelete = useCallback(() => {
    setUserEntry((curr) => curr.slice(0, curr.length - 1));
  }, []);

  const onDeleteAll = useCallback(() => {
    setUserEntry('');
  }, []);

  const enteredLength = userEntry.length;
  const finished = enteredLength === PIN_CODE_LENGTH;

  useEffect(() => {
    if (finished) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onPinEntered(Sha256(userEntry));
    }
  }, [onPinEntered, userEntry, finished]);

  return {
    clear: onDeleteAll,
    enteredLength,
    onPressDelete: !finished && enteredLength ? onPressDelete : undefined,
    onPressDeleteAll: !finished && enteredLength ? onDeleteAll : undefined,
    onPressDigit:
      !finished && enteredLength < PIN_CODE_LENGTH ? onPressDigit : undefined,
  };
};

type ValidatePin = (entry: string) => boolean;

/**
 * Validate user entered PIN against the stored one
 * @returns {boolean} `true` if the user entry matches the stored
 */
export const usePinCodeValidation = (): ValidatePin => {
  const [storedEntry, setStoredEntry] = useState<string>(); // sha-256 hash
  useEffect(() => {
    loadPinCode().then((loaded) => {
      if (loaded) {
        setStoredEntry(loaded);
      } else {
        reportError('PIN cannot be loaded');
      }
    });
  }, []);

  return useCallback<ValidatePin>(
    (entry) => storedEntry === entry,
    [storedEntry],
  );
};
