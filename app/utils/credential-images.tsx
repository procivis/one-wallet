import {
  CarouselImage,
  CarouselImageType,
  ImageOrComponent,
} from '@procivis/one-react-native-components';
import {
  Claim,
  CredentialSchemaCodeType,
  CredentialSchemaLayoutProperties,
} from '@procivis/react-native-one-core';
import React from 'react';
import { StyleSheet } from 'react-native';

import {
  Barcode,
  Mrz,
  QrCode,
} from '../components/credential/credential-carousel-images';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
});

export const getCarouselImagesFromClaims = (
  claims: Claim[],
  layoutProperties?: CredentialSchemaLayoutProperties,
): CarouselImage[] => {
  const result: CarouselImage[] = [];

  if (!layoutProperties) {
    return result;
  }

  const { code, pictureAttribute } = layoutProperties;

  if (pictureAttribute) {
    const pictureClaim = claims.find((claim) => claim.key === pictureAttribute);
    if (pictureClaim) {
      result.push({
        element: (
          <ImageOrComponent
            source={{ imageSource: { uri: pictureClaim.value as string } }}
            style={styles.container}
          />
        ),
        type: CarouselImageType.Photo,
      });
    }
  }

  if (code) {
    const claim = claims.find(({ key }) => key === code.attribute)?.value;

    if (!claim || typeof claim !== 'string') {
      return result;
    }

    if (code.type === CredentialSchemaCodeType.QR_CODE) {
      result.push({
        element: <QrCode content={claim} />,
        type: CarouselImageType.QrCode,
      });
    } else if (code.type === CredentialSchemaCodeType.BARCODE) {
      result.push({
        element: <Barcode content={claim} />,
        type: CarouselImageType.Barcode,
      });
    } else if (code.type === CredentialSchemaCodeType.MRZ) {
      result.push({
        element: <Mrz content={claim} />,
        type: CarouselImageType.MRZ,
      });
    }
  }

  return result;
};
