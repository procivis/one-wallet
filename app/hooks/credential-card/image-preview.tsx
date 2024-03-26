import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { ImageSourcePropType } from 'react-native';

import { RootNavigationProp } from '../../navigators/root/root-routes';

export const useCredentialImagePreview = () => {
  const rootNavigation = useNavigation<RootNavigationProp<any>>();

  const onImagePreview = useCallback(
    (title: string, image: ImageSourcePropType) => {
      rootNavigation.navigate('ImagePreview', {
        image,
        title,
      });
    },
    [rootNavigation],
  );

  return onImagePreview;
};
