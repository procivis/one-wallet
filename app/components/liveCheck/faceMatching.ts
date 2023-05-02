/* eslint-disable @typescript-eslint/naming-convention */
import { Buffer } from 'buffer';

export const facesMatch = async (a: string, b: string): Promise<boolean> => {
  const [faceId1, faceId2] = await Promise.all([getFaceId(a), getFaceId(b)]);
  return faceVerify(faceId1, faceId2);
};

const FACE_ID_CACHE_TIMEOUT_SECS = 600;
const FACE_ID_CACHE: Record<
  string /* imageBase64 */,
  {
    faceId: string;
    validUntil: number;
  }
> = {};

const getFaceId = async (imageBase64: string): Promise<string> => {
  if (imageBase64 in FACE_ID_CACHE && FACE_ID_CACHE[imageBase64].validUntil > Date.now()) {
    return FACE_ID_CACHE[imageBase64].faceId;
  } else {
    const faceId = await faceDetect(imageBase64);
    FACE_ID_CACHE[imageBase64] = { faceId, validUntil: Date.now() + FACE_ID_CACHE_TIMEOUT_SECS * 1000 };
    return faceId;
  }
};

const AZURE_KEY = '01e38d68a0d0448188ca46c2b7875164';
const baseUrlFaceService = 'https://fs-burgerwallet.cognitiveservices.azure.com/face/v1.0';

const faceDetect = (imageBase64: string): Promise<string> => {
  return fetch(
    `${baseUrlFaceService}/detect?returnFaceId=true&returnFaceLandmarks=false&recognitionModel=recognition_03&returnRecognitionModel=false&detectionModel=detection_02&faceIdTimeToLive=${FACE_ID_CACHE_TIMEOUT_SECS}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
      },
      body: Buffer.from(imageBase64, 'base64'),
    },
  )
    .then((value) => value.json())
    .then((res) => res[0].faceId);
};

const faceVerify = (faceId1: string, faceId2: string): Promise<boolean> => {
  return fetch(`${baseUrlFaceService}/verify`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': AZURE_KEY,
    },
    body: JSON.stringify({
      faceId1,
      faceId2,
    }),
  })
    .then((value) => value.json())
    .then(({ isIdentical }) => isIdentical);
};
