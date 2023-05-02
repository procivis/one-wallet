import { ClassAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Vibration } from 'react-native';
import { RNCamera, RNCameraProps } from 'react-native-camera';
import PassportReader, { ProgressStage, ScanResult } from 'react-native-passport-reader';

import { translate } from '../../i18n';
import { useIsAppActive } from '../../utils/appState';
import { useMRZScanner } from '../../utils/card-scan/mrz';
import { MRZData } from '../../utils/card-scan/mrzExtraction';
import { reportException } from '../../utils/reporting';
import { useMemoAsync } from '../../utils/useMemoAsync';
import { preventBackgroundLockScreen } from '../pin-code/pin-code-cover';

export const useNFCSupported = () => {
  return useMemo(() => PassportReader.isSupported, []);
};

export const useNFCEnabled = () => {
  const appActive = useIsAppActive();
  const enabled = useMemoAsync(() => PassportReader.isEnabled(), [appActive]);
  return { enabled, openSettings: PassportReader.openNFCSettings };
};

export enum Status {
  ScanMRZ = 'scanMRZ',
  Hold = 'hold',
  MRZCheck = 'mrzCheck',
  NFCStartPrompt = 'nfcStart',
  NFCTransferInProgress = 'nfcInProgress',
  NFCScanSuccess = 'nfcSuccess',
  NFCScanFailure = 'nfcFailure',
}

const MRZ_FIELDS = [
  'documentNumber',
  'birthDateYYMMDD',
  'expirationDateYYMMDD',
  'birthDate',
  'validDate',
  'issuingState',
] as const;
type MRZDataSubset = Pick<MRZData, typeof MRZ_FIELDS[number]>;

const nfcScan = async (mrz: MRZDataSubset, onProgress: (progress: number) => void) => {
  const documentNumber = mrz.documentNumber;
  const dateOfBirth = mrz.birthDateYYMMDD;
  const dateOfExpiry = mrz.expirationDateYYMMDD;
  if (!documentNumber || !dateOfBirth || !dateOfExpiry) {
    throw new Error('Passport MRZ data missing');
  }

  const enablePinLockScreen = preventBackgroundLockScreen();
  try {
    const data = await PassportReader.scan(
      {
        documentNumber,
        dateOfBirth,
        dateOfExpiry,
        sessionLabels: {
          [ProgressStage.lookingForNFCTag]: translate('onboarding.passportScan.nfcInProgress.status.looking'),
          [ProgressStage.authenticating]: translate('onboarding.passportScan.nfcInProgress.status.authenticating'),
          [ProgressStage.readingDG1]: translate('onboarding.passportScan.nfcInProgress.status.details'),
          [ProgressStage.readingDG2]: translate('onboarding.passportScan.nfcInProgress.status.photo'),
          [ProgressStage.readingGeneric]: translate('onboarding.passportScan.nfcInProgress.status.verifying'),
          [ProgressStage.success]: translate('onboarding.passportScan.nfcInProgress.status.success'),
          [ProgressStage.errorInvalidMRZ]: translate('onboarding.passportScan.nfcInProgress.status.error.invalidMRZ'),
          [ProgressStage.errorInvalidTag]: translate('onboarding.passportScan.nfcInProgress.status.error.invalidTag'),
          [ProgressStage.errorConnection]: translate('onboarding.passportScan.nfcInProgress.status.error.connection'),
          [ProgressStage.errorGeneric]: translate('onboarding.passportScan.nfcInProgress.status.error.generic'),
        },
      },
      onProgress,
    );
    return data;
  } finally {
    enablePinLockScreen();
  }
};

type PassportScanner =
  | {
      status: Status.ScanMRZ | Status.Hold;
      cameraProps: Partial<RNCameraProps & ClassAttributes<RNCamera>>;
    }
  | {
      status: Status.MRZCheck;
      mrz: MRZDataSubset;
      confirmMRZScan: () => void;
      restartMRZScan: () => void;
    }
  | {
      status: Status.NFCStartPrompt;
      startNFCScan?: () => void;
    }
  | {
      status: Status.NFCTransferInProgress;
      nfcProgress: number;
    }
  | {
      status: Status.NFCScanFailure;
      startNFCScan: () => void;
    }
  | {
      status: Status.NFCScanSuccess;
      mrz: MRZDataSubset;
      nfcData: ScanResult;
    };

export const usePassportScanner = (): PassportScanner => {
  const camera = useRef<RNCamera>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const onCameraReady = useCallback(() => setCameraReady(true), []);

  const [mrz, setMRZInfo] = useState<MRZDataSubset>();

  const { mrzInfo, processing, onTextRecognized, retry: retryMRZ } = useMRZScanner(camera, cameraReady && !mrz, {
    fields: MRZ_FIELDS,
    documents: [/^P\w?/], // Passport documents: P*
  });
  useEffect(() => {
    if (mrz) return;
    if (!processing && mrzInfo) {
      setMRZInfo(mrzInfo as MRZDataSubset);
    }
  }, [mrz, processing, mrzInfo]);

  const [mrzChecked, setMRZChecked] = useState<boolean>(false);
  const confirmMRZScan = useCallback(() => setMRZChecked(true), []);
  const restartMRZScan = useCallback(() => {
    retryMRZ();
    setMRZInfo(undefined);
  }, [retryMRZ]);

  const [nfcProgress, setNFCProgress] = useState<number>();
  const [nfcData, setNFCData] = useState<ScanResult>();
  const [nfcFailure, setNFCFailure] = useState<Error>();

  const status: Status = !mrz
    ? processing
      ? Status.Hold
      : Status.ScanMRZ
    : !mrzChecked
    ? Status.MRZCheck
    : !nfcData
    ? nfcFailure
      ? Status.NFCScanFailure
      : !nfcProgress
      ? Status.NFCStartPrompt
      : Status.NFCTransferInProgress
    : Status.NFCScanSuccess;

  const startNFCScan = useCallback(() => {
    if (!mrz) return;
    setNFCProgress(0);
    setNFCFailure(undefined);
    nfcScan(mrz, setNFCProgress)
      .then(setNFCData)
      .catch((e) => {
        reportException(e, 'NFC transfer failure');
        setNFCFailure(e);
        setNFCProgress(undefined);
      });
  }, [mrz]);

  // vibrate on iOS upon tag discovery
  const nfcInProgress = Boolean(nfcProgress);
  useEffect(() => {
    if (nfcInProgress && Platform.OS === 'ios') {
      Vibration.vibrate();
    }
  }, [nfcInProgress]);

  // automatically start NFC scan on android, prompt user first on iOS
  useEffect(() => {
    if (status === Status.NFCStartPrompt && nfcProgress === undefined && Platform.OS === 'android') {
      startNFCScan();
    }
  }, [status, nfcProgress, startNFCScan]);

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  switch (status) {
    case Status.ScanMRZ:
    case Status.Hold:
      return {
        status,
        cameraProps: {
          ref: camera,
          onCameraReady,
          onTextRecognized,
        },
      };
    case Status.MRZCheck:
      return {
        status,
        mrz: mrz!,
        restartMRZScan,
        confirmMRZScan,
      };
    case Status.NFCStartPrompt:
      return {
        status,
        startNFCScan: Platform.OS === 'android' ? undefined : startNFCScan,
      };
    case Status.NFCScanFailure:
      return {
        status,
        startNFCScan,
      };
    case Status.NFCTransferInProgress:
      return {
        status,
        nfcProgress: nfcProgress!,
      };
    case Status.NFCScanSuccess:
      return {
        status,
        mrz: mrz!,
        nfcData: nfcData!,
      };
  }
};
