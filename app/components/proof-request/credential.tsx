import { CredentialDetailsCardListItem } from '@procivis/one-react-native-components';
import { PresentationDefinitionRequestedCredential } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { ImageSourcePropType, StyleSheet } from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialDetail } from '../../hooks/credentials';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { selectCredentialCardFromCredential } from '../credential/parsers';

export const Credential: FC<{
  credentialId: string;
  lastItem: boolean;
  onPress?: () => void;
  request: PresentationDefinitionRequestedCredential;
  selected: boolean;
  testID?: string;
}> = ({ testID, credentialId, selected, lastItem, request, onPress }) => {
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

  const { card, attributes } = selectCredentialCardFromCredential(
    credential,
    selected,
    request,
    config,
    testID,
  );

  return (
    <CredentialDetailsCardListItem
      attributes={attributes}
      card={{
        ...card,
        onHeaderPress: onPress,
      }}
      expanded={selected}
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
