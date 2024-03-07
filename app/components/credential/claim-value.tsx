import {
  formatDate,
  ImageAttributeButton,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { Claim, DataTypeEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { useCoreConfig } from '../../hooks/core-config';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

export const ClaimValue: FunctionComponent<{
  claim: Claim;
  testID?: string;
}> = ({ claim, testID }) => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const { data: config } = useCoreConfig();

  const onImagePreview = useCallback(() => {
    navigation.navigate('ImagePreview', {
      image: claim.value,
      title: claim.key,
    });
  }, [navigation, claim]);

  if (!config) {
    return null;
  }

  let stringValue: string = claim.value;
  const typeConfig = config.datatype[claim.dataType];
  switch (typeConfig?.type) {
    case DataTypeEnum.Date: {
      stringValue = formatDate(new Date(claim.value)) ?? claim.value;
      break;
    }
    case DataTypeEnum.File: {
      if (typeConfig.params?.showAs === 'IMAGE') {
        return (
          <ImageAttributeButton
            onPress={onImagePreview}
            testID={testID}
            title={translate('claim.image.action')}
          />
        );
      }
      break;
    }
    default:
      break;
  }

  return (
    <Typography color={colorScheme.text} numberOfLines={10} testID={testID}>
      {stringValue}
    </Typography>
  );
};
