import { CredentialListItem } from '@procivis/react-native-one-core';
import React, { FC, useCallback, useState } from 'react';
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
  const [expandedCredential, setExpandedCredential] = useState<string>();

  const onHeaderPress = useCallback((credentialId?: string) => {
    if (!credentialId) {
      return;
    }
    setExpandedCredential((oldValue) => {
      if (credentialId === oldValue) {
        return undefined;
      }
      return credentialId;
    });
  }, []);

  if (!credentials || credentials.length === 0) {
    return null;
  }

  return (
    <Section
      style={[styles.credentials, fullWidth && styles.credentialsFullWidth]}
      title={title}
    >
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
    </Section>
  );
};

const styles = StyleSheet.create({
  credentials: {
    marginBottom: 0,
  },
  credentialsFullWidth: {
    paddingHorizontal: 0,
  },
});
