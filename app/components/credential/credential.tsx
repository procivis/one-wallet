import { Accordion, TextAvatar } from '@procivis/react-native-components';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCredentialDetail } from '../../hooks/credentials';
import { Claim } from './claim';

interface CredentialProps {
  credentialId: string;
  expanded?: boolean;
}

export const Credential: FC<CredentialProps> = ({
  credentialId,
  expanded = false,
}) => {
  const { data: credential } = useCredentialDetail(credentialId);

  if (!credential) {
    return null;
  }

  return (
    <Accordion
      icon={{
        component: (
          <TextAvatar
            innerSize={48}
            produceInitials={true}
            shape="rect"
            text={credential.schema.name}
          />
        ),
      }}
      initiallyExpanded={expanded}
      title={credential.schema.name}
    >
      <View style={styles.claims}>
        {credential.claims.map((claim, index, { length }) => (
          <Claim claim={claim} key={claim.id} last={length === index + 1} />
        ))}
      </View>
    </Accordion>
  );
};

const styles = StyleSheet.create({
  claims: {
    paddingBottom: 12,
  },
});
