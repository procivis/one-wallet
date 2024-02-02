import { Accordion, TextAvatar } from '@procivis/react-native-components';
import { CredentialDetail } from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { Claim } from '../credential/claim';

interface CredentialProps {
  credential: CredentialDetail;
}

const Credential: FC<CredentialProps> = ({ credential }) => {
  return (
    <Accordion
      icon={{
        component: (
          <TextAvatar
            innerSize={48}
            produceInitials={true}
            text={credential.schema.name}
          />
        ),
      }}
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

export default Credential;
