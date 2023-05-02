import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Face, RNCamera, RNCameraProps, TakePictureOptions } from 'react-native-camera';

import { delay } from '../../utils/delay';
import { reportException } from '../../utils/reporting';
import { Stage } from './camera-overlay';
import { facesMatch } from './faceMatching';

enum Side {
  Front = 'front',
  Left = 'left',
  Right = 'right',
}

const PICTURE_OPTIONS: TakePictureOptions = {
  quality: 0.7,
  base64: true,
  doNotSave: true,
  fixOrientation: true,
  forceUpOrientation: true,
};

interface FaceSetting {
  readonly minDelta: number;
  readonly maxDelta: number;
}

const FACE_SETTINGS: Record<Side, FaceSetting> = {
  [Side.Front]: {
    minDelta: -20,
    maxDelta: 20,
  },
  [Side.Left]: {
    minDelta: Platform.OS === 'ios' ? -70 : 20,
    maxDelta: Platform.OS === 'ios' ? -20 : 70,
  },
  [Side.Right]: {
    minDelta: Platform.OS === 'ios' ? 20 : -70,
    maxDelta: Platform.OS === 'ios' ? 70 : -20,
  },
};

const faceSidePostureValid = (face: Face, faceSetting: FaceSetting) => {
  return face.yawAngle !== undefined && face.yawAngle < faceSetting.maxDelta && face.yawAngle > faceSetting.minDelta;
};

export const useLiveCheck = (idImageURI: string, onSuccess: () => void) => {
  const idImageBase64 = useMemo(() => idImageURI.split(';base64,').reverse()[0], [idImageURI]);

  const camera = useRef<RNCamera>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const onCameraReady = useCallback(() => setCameraReady(true), []);

  const [portrait, setPortrait] = useState<Partial<Record<Side, string>>>({});
  const [currentSide, setCurrentSide] = useState<Side | null>(Side.Front);

  const [processing, setProcessing] = useState<boolean>(false);

  const handleFacesDetected = useCallback(
    async (faces: Face[]) => {
      if (!faces?.length || faces.length !== 1 || !camera.current || !currentSide) return;
      const face = faces[0];
      if (!faceSidePostureValid(face, FACE_SETTINGS[currentSide])) return;
      setProcessing(true);

      await camera.current
        .takePictureAsync(PICTURE_OPTIONS)
        .then(async (response) => {
          if (Platform.OS === 'ios') camera.current?.pausePreview();
          if (!response.base64) throw new Error('Picture not taken');
          if (await facesMatch(idImageBase64, response.base64)) {
            setPortrait((aggr) => ({ ...aggr, [currentSide]: response.base64 }));
            setCurrentSide(null);
          } else {
            camera.current?.resumePreview();
          }
          setProcessing(false);
        })
        .catch((e) => {
          reportException(e, `Live check failure: ${currentSide}`);
          setProcessing(false);
          camera.current?.resumePreview();
        });
    },
    [idImageBase64, currentSide],
  );

  useEffect(() => {
    const nextSide =
      Side.Front in portrait
        ? Side.Left in portrait
          ? Side.Right in portrait
            ? null
            : Side.Right
          : Side.Left
        : Side.Front;

    switch (nextSide) {
      case Side.Front:
        break;
      case Side.Right:
        setCurrentSide(Side.Right);
        camera.current?.resumePreview();
        break;
      case Side.Left:
        delay(1000).then(() => {
          setCurrentSide(Side.Left);
          camera.current?.resumePreview();
        });
        break;
      case null:
        delay(1000).then(() => {
          onSuccess();
        });
        break;
    }
  }, [onSuccess, portrait]);

  const stage: Stage =
    currentSide === null
      ? Stage.Recognized
      : currentSide === Side.Front
      ? Stage.Initial
      : currentSide === Side.Left
      ? Stage.LookLeft
      : Stage.LookRight;

  const [facesDetected, setFacesDetected] = useState<Face[]>([]);
  const onFacesDetected = useCallback<Required<RNCameraProps>['onFacesDetected']>(({ faces }) => {
    setFacesDetected(faces);
  }, []);
  useEffect(() => {
    if (cameraReady && currentSide && !processing && facesDetected.length) {
      setFacesDetected([]);
      handleFacesDetected(facesDetected);
    }
  }, [cameraReady, currentSide, facesDetected, processing, handleFacesDetected]);

  return {
    stage,
    processing,
    cameraProps: {
      ref: camera,
      onCameraReady,
      onFacesDetected: cameraReady ? onFacesDetected : undefined,
      faceDetectionClassifications: RNCamera.Constants.FaceDetection.Classifications.all,
      faceDetectionLandmarks: RNCamera.Constants.FaceDetection.Landmarks.all,
      faceDetectionMode: RNCamera.Constants.FaceDetection.Mode.accurate,
    },
  };
};
