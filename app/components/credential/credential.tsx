import { CredentialDetailsCardListItem } from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCredentialDetail } from '../../hooks/credentials';
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
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCredentialImagePreview();

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
