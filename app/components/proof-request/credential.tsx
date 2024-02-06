import {
  Accordion,
  concatTestID,
  formatDateTime,
  Selector,
  SelectorStatus,
  TextAvatar,
} from '@procivis/react-native-components';
import { PresentationDefinitionRequestedCredential } from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { supportsSelectiveDisclosure } from '../../utils/credential';
import { Claim } from '../credential/claim';
import { SelectiveDislosureNotice } from './selective-disclosure-notice';

export const Credential: FC<{
  credentialId: string;
  onPress?: () => void;
  request: PresentationDefinitionRequestedCredential;
  selected: boolean;
  testID?: string;
}> = ({ testID, credentialId, selected, request, onPress }) => {
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();

  if (!credential || !config) {
    return null;
  }

  const selectiveDisclosureSupported = supportsSelectiveDisclosure(
    credential,
    config,
  );

  return (
    <Accordion
      accessibilityState={{ selected }}
      contentStyle={styles.content}
      expanded={selected}
      headerNotice={
        selectiveDisclosureSupported === false && (
          <SelectiveDislosureNotice
            style={styles.headerNotice}
            testID={concatTestID(testID, 'notice.selectiveDisclosure')}
          />
        )
      }
      icon={{
        component: (
          <TextAvatar
            innerSize={48}
            produceInitials={true}
            text={credential.schema.name}
          />
        ),
      }}
      onPress={onPress}
      rightAccessory={
        <Selector
          status={
            selected ? SelectorStatus.SelectedRadio : SelectorStatus.Unselected
          }
        />
      }
      subtitle={translate('proofRequest.selectCredential.issued', {
        date: formatDateTime(new Date(credential.issuanceDate)),
      })}
      testID={testID}
      title={credential.schema.name}
      titleStyle={{
        testID: concatTestID(testID, selected ? 'selected' : 'unselected'),
      }}
    >
      {request.fields.map((field, index, { length }) => {
        const claim = credential.claims.find(
          ({ key }) => key === field.keyMap[credentialId],
        );
        return (
          <Claim
            claim={claim}
            key={field.id}
            last={length === index + 1}
            title={field.name ?? claim?.key ?? field.id}
          />
        );
      })}
    </Accordion>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 12,
  },
  headerNotice: {
    marginTop: 8,
  },
});
