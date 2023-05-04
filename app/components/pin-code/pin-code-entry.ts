import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

import { translate } from '../../i18n';
import { reportError } from '../../utils/reporting';
import { Sha256 } from '../../utils/sha256';
import { loadString, remove, saveString } from '../../utils/storage';

export const PIN_CODE_LENGTH = 6;
const STORAGE_KEY = 'pin-code-sha256';

export enum PinCodeMode {
  Initialization = 'initialization',
  Check = 'check',
  Change = 'change',
}

export enum PinCodeEntryStage {
  Initial = 'initial',
  Confirm = 'confirm',
  Check = 'check',
}

interface PinCodeEntryStatus {
  stage: PinCodeEntryStage;
  enteredLength: number;
  finished: boolean;
  error?: string;
  onPressDigit?: (digit: number) => void;
  onPressDelete?: () => void;
  onPressDeleteAll?: () => void;
}

async function loadPinCode(): Promise<string | null> {
  return loadString(STORAGE_KEY);
}

// emitted when pin code initialized
const PIN_CODE_INITIALIZATION_EVENT = 'pin-code-initialization';
let globalPinInitialized: boolean | undefined;
export function usePinCodeInitialized(): boolean | undefined {
  const [initialized, setInitialized] = useState<boolean | undefined>(globalPinInitialized);
  useEffect(() => {
    if (globalPinInitialized === undefined) {
      loadPinCode().then((loaded) => {
        setInitialized(Boolean(loaded));
        globalPinInitialized = Boolean(loaded);
      });
    }

    const subscription = DeviceEventEmitter.addListener(PIN_CODE_INITIALIZATION_EVENT, () =>
      setInitialized(globalPinInitialized),
    );
    return () => subscription.remove();
  }, []);

  return initialized;
}

function storePin(pinSha256: string): void {
  saveString(STORAGE_KEY, pinSha256)
    .then((successful) => {
      if (!successful) {
        console.warn("Couldn't store PIN");
      } else {
        globalPinInitialized = true;
        DeviceEventEmitter.emit(PIN_CODE_INITIALIZATION_EVENT);
      }
    })
    .catch((e) => {
      console.warn("Couldn't store PIN", e);
    });
}

export const usePinCodeEntry = (mode: PinCodeMode): PinCodeEntryStatus => {
  const [stage, setStage] = useState<PinCodeEntryStage>(
    mode === PinCodeMode.Initialization ? PinCodeEntryStage.Initial : PinCodeEntryStage.Check,
  );

  const [storedEntry, setStoredEntry] = useState<string>(); // sha-256 hash
  useEffect(() => {
    if (mode !== PinCodeMode.Initialization) {
      loadPinCode().then((loaded) => {
        if (loaded) {
          setStoredEntry(loaded);
        } else {
          reportError('PIN cannot be loaded');
          setStage(PinCodeEntryStage.Initial);
        }
      });
    }
  }, [mode]);

  const [userEntry, setUserEntry] = useState<string>('');
  const [error, setError] = useState<string>();

  const onPressDigit = useCallback((digit: number) => {
    setUserEntry((curr) => `${curr}${digit}`);
    setError(undefined);
  }, []);

  const onPressDelete = useCallback(() => {
    setUserEntry((curr) => curr.slice(0, curr.length - 1));
  }, []);

  const onPressDeleteAll = useCallback(() => {
    setUserEntry('');
  }, []);

  const enteredLength = userEntry.length;
  const validated = enteredLength === PIN_CODE_LENGTH && storedEntry === Sha256(userEntry);

  useEffect(() => {
    if (userEntry.length !== PIN_CODE_LENGTH) return;

    switch (stage) {
      case PinCodeEntryStage.Initial:
        setStage(PinCodeEntryStage.Confirm);
        setStoredEntry(Sha256(userEntry));
        setUserEntry('');
        break;
      case PinCodeEntryStage.Confirm:
        if (validated) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          storePin(storedEntry!);
        } else {
          setError(translate('onboarding.pinCodeScreen.confirm.error'));
          setUserEntry('');
        }
        break;
      case PinCodeEntryStage.Check:
        if (!validated) {
          setError(translate('onboarding.pinCodeScreen.check.error'));
          setUserEntry('');
        } else if (mode === PinCodeMode.Change) {
          setStage(PinCodeEntryStage.Initial);
          setStoredEntry(undefined);
          setUserEntry('');
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, stage, userEntry, validated]);

  const finished = validated && (mode === PinCodeMode.Check || stage === PinCodeEntryStage.Confirm);
  return {
    finished,
    stage,
    enteredLength,
    error,
    onPressDigit: !finished && enteredLength < PIN_CODE_LENGTH ? onPressDigit : undefined,
    onPressDelete: !finished && enteredLength ? onPressDelete : undefined,
    onPressDeleteAll: !finished && enteredLength ? onPressDeleteAll : undefined,
  };
};

export async function removePin(): Promise<void> {
  return remove(STORAGE_KEY).then(() => {
    globalPinInitialized = false;
    DeviceEventEmitter.emit(PIN_CODE_INITIALIZATION_EVENT);
  });
}
