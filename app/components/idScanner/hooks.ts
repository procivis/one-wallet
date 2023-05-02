import { useCallback, useEffect, useRef, useState } from 'react';
import { Face, RNCamera, RNCameraProps, TakePictureOptions } from 'react-native-camera';
import RNFS from 'react-native-fs';

import { useMRZScanner } from '../../utils/card-scan/mrz';
import { MRZData } from '../../utils/card-scan/mrzExtraction';
import { delay } from '../../utils/delay';
import { reportException } from '../../utils/reporting';
import { extractPortrait } from './idExtraction';

export enum Status {
  ScanFront = 'scanFront',
  FrontRecognized = 'frontRecognized',
  Hold = 'hold',
  ScanBack = 'scanBack',
  BackRecognized = 'backRecognized',
}

const PICTURE_OPTIONS: TakePictureOptions = {
  quality: 1,
  doNotSave: false,
  base64: false,
  fixOrientation: true,
  forceUpOrientation: true,
};

const MRZ_FIELDS = [
  'givenName',
  'surName',
  'birthDate',
  'validDate',
  'sex',
  'documentNumber',
  'expirationDateYYMMDD',
  'issuingState',
  'nationality',
] as const;
type MRZDataSubset = Pick<MRZData, typeof MRZ_FIELDS[number]>;
export type IDScannerResult = MRZDataSubset & { portrait: string };

export const useIDScanner = (onFinished: (data: IDScannerResult) => void) => {
  const camera = useRef<RNCamera>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const onCameraReady = useCallback(() => setCameraReady(true), []);

  const [stage, setStage] = useState<'aim' | 'process' | 'success'>('aim');
  const [portrait, setPortrait] = useState<string>();
  const [personalInfo, setPersonalInfo] = useState<MRZDataSubset>();

  const handleFacesDetected = useCallback(async (faces: Face[]) => {
    if (!faces?.length || !camera.current) return;
    setStage('process');

    await delay(500);
    await camera.current
      ?.takePictureAsync(PICTURE_OPTIONS)
      .then(async (response) => {
        try {
          const portrait = await extractPortrait(response.uri);
          setPortrait(portrait);
          setStage('success');
        } finally {
          await RNFS.unlink(response.uri).catch(() => null);
        }
      })
      .catch((e) => {
        reportException(e, 'Front ID scan failure');
        setStage('aim');
      });
  }, []);

  const [mrzInitCooldown, setMRZInitCooldown] = useState(true);
  const { mrzInfo, processing, onTextRecognized } = useMRZScanner(
    camera,
    Boolean(cameraReady && portrait && !personalInfo && !mrzInitCooldown && stage === 'aim'),
    {
      fields: MRZ_FIELDS,
      documents: [/^[IAC]\w?/], // Identity card documents: I, A or C
    },
  );
  useEffect(() => {
    if (processing) {
      setStage('process');
    } else if (mrzInfo) {
      setPersonalInfo(mrzInfo as MRZDataSubset);
      setStage('success');
    } else {
      setStage('aim');
    }
  }, [processing, mrzInfo]);

  useEffect(() => {
    if (stage === 'success') {
      delay(1000).then(() => {
        if (personalInfo && portrait) {
          onFinished({ ...personalInfo, portrait });
        } else {
          // start MRZ (back side) scan
          setStage('aim');
          // show instruction for some time before starting scanning
          delay(2500).then(() => setMRZInitCooldown(false));
        }
      });
    }
  }, [stage, onFinished, personalInfo, portrait]);

  const status: Status =
    stage === 'process'
      ? Status.Hold
      : stage === 'success'
      ? personalInfo
        ? Status.BackRecognized
        : Status.FrontRecognized
      : portrait
      ? Status.ScanBack
      : Status.ScanFront;

  const [facesDetected, setFacesDetected] = useState<Face[]>([]);
  const onFacesDetected = useCallback<Required<RNCameraProps>['onFacesDetected']>(({ faces }) => {
    setFacesDetected(faces);
  }, []);
  useEffect(() => {
    if (cameraReady && stage === 'aim' && !portrait && facesDetected.length) {
      setFacesDetected([]);
      handleFacesDetected(facesDetected);
    }
  }, [cameraReady, stage, facesDetected, portrait, handleFacesDetected]);

  // the detection callbacks should get specified only after the camera is ready (https://github.com/react-native-camera/react-native-camera/issues/2349#issuecomment-512828328)
  const cameraProps: RNCameraProps = {
    onCameraReady,
    onFacesDetected: cameraReady ? onFacesDetected : undefined,
    faceDetectionClassifications: RNCamera.Constants.FaceDetection.Classifications.none,
    faceDetectionLandmarks: RNCamera.Constants.FaceDetection.Landmarks.none,
    faceDetectionMode: RNCamera.Constants.FaceDetection.Mode.accurate,
    onTextRecognized: cameraReady ? onTextRecognized : undefined,
  };

  return {
    status,
    cameraProps: {
      ref: camera,
      ...cameraProps,
    },
  };
};
