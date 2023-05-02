import ImageEditor from '@react-native-community/image-editor';
import FaceDetection, {
  FaceDetectorClassificationMode,
  FaceDetectorContourMode,
  FaceDetectorLandmarkMode,
  FaceDetectorPerformanceMode,
  FaceResult,
} from 'react-native-face-detection';
import RNFS from 'react-native-fs';

import { base64ToImageURI } from '../../utils/image';

export const extractPortrait = async (filePath: string) => {
  const objects = await FaceDetection.processImage(filePath, {
    performanceMode: FaceDetectorPerformanceMode.ACCURATE,
    classificationMode: FaceDetectorClassificationMode.NONE,
    landmarkMode: FaceDetectorLandmarkMode.NO,
    contourMode: FaceDetectorContourMode.NONE,
  });
  const bestObject = pickBestObject(objects);
  const cropped = await cropImage(filePath, bestObject, filePath.split('.').reverse()[0]);
  return cropped;
};

// Utility code re-used from the POCeid project

interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

const pickBestObject = (faces: FaceResult[]) => {
  let bestRect: Rectangle | undefined;
  faces.forEach((element) => {
    const [left, top, right, bottom] = element.boundingBox;
    const width = right - left;
    const height = bottom - top;
    const faceRectangle: Rectangle = { left, top, width, height };
    if (left && top && width && height) {
      if (bestRect) {
        if (bestRect.width <= width && bestRect.height <= height) {
          bestRect = faceRectangle;
        }
      } else {
        bestRect = faceRectangle;
      }
    }
  });
  if (!bestRect) {
    throw new Error('No picture found');
  }
  return bestRect;
};

// crop double size (to include surrounding of the face)
const CROP_INCLUDE_RATIO = 2;
const cropImage = (originalPath: string, rect: Rectangle, format: string) => {
  return ImageEditor.cropImage(originalPath, {
    offset: {
      x: Math.max(0, rect.left - (rect.width / 2) * (CROP_INCLUDE_RATIO - 1)),
      y: Math.max(0, rect.top - (rect.height / 2) * (CROP_INCLUDE_RATIO - 1)),
    },
    size: {
      width: rect.width * CROP_INCLUDE_RATIO,
      height: rect.height * CROP_INCLUDE_RATIO,
    },
  }).then(async (croppedPath) => {
    try {
      return base64ToImageURI(await RNFS.readFile(croppedPath, 'base64'), format);
    } finally {
      await RNFS.unlink(croppedPath).catch(() => null);
    }
  });
};
