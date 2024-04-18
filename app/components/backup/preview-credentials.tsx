import { CredentialListItem } from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { View } from 'react-native';

import { useCredentialListExpandedCard } from '../../hooks/credential-card/credential-card-expanding';
import { Credential } from '../credential/credential';

interface PreviewCredentialsProps {
  credentials: CredentialListItem[] | undefined;
  fullWidth?: boolean;
  title: string;
}

export const PreviewCredentials: FC<PreviewCredentialsProps> = ({
  credentials,
}) => {
  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();

  if (!credentials || credentials.length === 0) {
    return null;
  }

  return (
    <View>
      {credentials.map((credential, index, { length }) => (
        <View key={credential.id}>
          <Credential
            credentialId={credential.id}
            expanded={expandedCredential === credential.id}
            lastItem={index === length - 1}
            onHeaderPress={onHeaderPress}
          />
        </View>
      ))}
    </View>
  );
};
