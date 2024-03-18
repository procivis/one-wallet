import { CredentialListItem } from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { Section } from '../common/section';
import { Credential } from '../credential/credential';

interface PreviewCredentialsProps {
  credentials: CredentialListItem[] | undefined;
  fullWidth?: boolean;
  title: string;
}

export const PreviewCredentials: FC<PreviewCredentialsProps> = ({
  credentials,
  fullWidth = false,
  title,
}) => {
  if (!credentials || credentials.length === 0) {
    return null;
  }

  return (
    <Section
      style={[styles.credentials, fullWidth && styles.credentialsFullWidth]}
      title={title}
    >
      {credentials.map((credential, index) => (
        <View
          key={credential.id}
          style={[styles.credential, index === 0 && styles.credentialFirst]}
        >
          <Credential credentialId={credential.id} />
        </View>
      ))}
    </Section>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginTop: 12,
  },
  credentialFirst: {
    marginTop: 0,
  },
  credentials: {
    marginBottom: 0,
  },
  credentialsFullWidth: {
    paddingHorizontal: 0,
  },
});
