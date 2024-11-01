import {
  CredentialDetails,
  useCredentialListExpandedCard,
} from '@procivis/one-react-native-components';
import { CredentialListItem } from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { View } from 'react-native';

import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { credentialCardLabels } from '../../utils/credential';

interface PreviewCredentialsProps {
  credentials: CredentialListItem[] | undefined;
}

export const PreviewCredentials: FC<PreviewCredentialsProps> = ({
  credentials,
}) => {
  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();
  const onImagePreview = useCredentialImagePreview();

  if (!credentials || credentials.length === 0) {
    return null;
  }

  return (
    <View>
      {credentials.map((credential, index, { length }) => (
        <View key={credential.id}>
          <CredentialDetails
            credentialId={credential.id}
            expanded={expandedCredential === credential.id}
            labels={credentialCardLabels()}
            lastItem={index === length - 1}
            onHeaderPress={onHeaderPress}
            onImagePreview={onImagePreview}
          />
        </View>
      ))}
    </View>
  );
};
