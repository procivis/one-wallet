import {
  concatTestID,
  CredentialDetailsCardListItem,
  CredentialHeaderProps,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import { useCoreConfig } from '../../hooks/core/core-config';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { detailsCardFromCredential } from '../../utils/credential';

export interface CredentialProps {
  credentialId: string;
  expanded?: boolean;
  headerAccessory?: CredentialHeaderProps['accessory'];
  lastItem?: boolean;
  onHeaderPress?: (credentialId?: string) => void;
}

export const Credential: FC<CredentialProps> = ({
  credentialId,
  expanded = false,
  lastItem,
  onHeaderPress,
  headerAccessory,
}) => {
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCredentialImagePreview();

  if (!credential || !config) {
    return null;
  }
  const testID = concatTestID('Credential.credential', credential.id);

  const { card, attributes } = detailsCardFromCredential(
    credential,
    config,
    testID,
  );
  if (headerAccessory) {
    card.header.accessory = headerAccessory;
  }

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
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 8,
  },
});
