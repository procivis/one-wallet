import { CredentialDetailsCardListItem } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialDetail } from '../../hooks/credentials';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { detailsCardFromCredential } from '../../utils/credential';

interface CredentialProps {
  credentialId: string;
  expanded?: boolean;
  lastItem?: boolean;
  onHeaderPress?: (credentialId?: string) => void;
}

export const Credential: FC<CredentialProps> = ({
  credentialId,
  expanded = false,
  lastItem,
  onHeaderPress,
}) => {
  const rootNavigation = useNavigation<RootNavigationProp<any>>();
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCallback(
    (title: string, image: ImageSourcePropType) => {
      rootNavigation.navigate('ImagePreview', {
        image,
        title,
      });
    },
    [rootNavigation],
  );

  if (!credential || !config) {
    return null;
  }

  const { card, attributes } = detailsCardFromCredential(credential, config);

  return (
    <CredentialDetailsCardListItem
      attributes={attributes}
      card={{
        ...card,
        credentialId,
        onHeaderPress,
      }}
      expanded={expanded}
      lastItem={lastItem}
      onImagePreview={onImagePreview}
      style={styles.credential}
    />
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 8,
  },
});
