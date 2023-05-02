import RNFS from 'react-native-fs';

const getMIMEType = (format: string) => {
  switch (format.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
  }
  throw new Error(`Unsupported format: ${format}`);
};

export const base64ToImageURI = (pictureBase64: string, format: string) =>
  `data:${getMIMEType(format)};base64,${pictureBase64}`;

export const convertImageToBase64Uri = async (imageFilePath: string) => {
  const format = imageFilePath.split('.').reverse()[0];
  return base64ToImageURI(await RNFS.readFile(imageFilePath, 'base64'), format);
};
