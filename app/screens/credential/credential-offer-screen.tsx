import {
  Accordion,
  SharingScreen,
  SharingScreenVariation,
  TextAvatar,
  Typography,
  useAppColorScheme,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';

const DataItem: FunctionComponent<{ attribute: string; value: string; last?: boolean }> = ({
  attribute,
  value,
  last,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.dataItem, last && styles.dataItemLast, { borderColor: colorScheme.lighterGrey }]}>
      <Typography color={colorScheme.textSecondary} size="sml" style={styles.dataItemLabel}>
        {attribute}
      </Typography>
      <Typography color={colorScheme.text}>{value}</Typography>
    </View>
  );
};

const CredentialOfferScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const issuanceNavigation = useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();

  const { credential } = route.params;

  useBlockOSBackNavigation();

  const onReject = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  const onAccept = useCallback(() => {
    issuanceNavigation.navigate('Processing', { credential });
  }, [credential, issuanceNavigation]);

  return (
    <SharingScreen
      variation={SharingScreenVariation.Neutral}
      title={translate('credentialOffer.title')}
      contentTitle={translate('credentialOffer.credential')}
      cancelLabel={translate('credentialOffer.reject')}
      onCancel={onReject}
      submitLabel={translate('credentialOffer.accept')}
      onSubmit={onAccept}
      header={
        <>
          <View style={styles.header}>
            <Typography size="sml" bold={true} caps={true} style={styles.headerLabel} accessibilityRole="header">
              {translate('credentialDetail.credential.issuer')}
            </Typography>
            <Typography color={colorScheme.text}>{credential.issuer}</Typography>
          </View>
          <View style={[styles.dataWrapper, { backgroundColor: colorScheme.background }]}>
            <DataItem attribute={translate('credentialDetail.credential.format')} value={credential.format} />
            <DataItem
              attribute={translate('credentialDetail.credential.revocationMethod')}
              value={credential.revocation}
            />
            <DataItem
              attribute={translate('credentialDetail.credential.transport')}
              value={credential.transport}
              last={true}
            />
          </View>
        </>
      }>
      <Accordion
        title={credential.schema}
        icon={{ component: <TextAvatar produceInitials={true} text={credential.schema} innerSize={48} /> }}>
        {credential.attributes.map((attribute, index, { length }) => (
          <DataItem key={attribute.key} attribute={attribute.key} value={attribute.value} last={length === index + 1} />
        ))}
      </Accordion>
    </SharingScreen>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    borderBottomWidth: 1,
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  dataItemLast: {
    borderBottomWidth: 0,
    marginBottom: 6,
  },
  dataWrapper: {
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 12,
    padding: 12,
  },
  headerLabel: {
    marginBottom: 4,
  },
});

export default CredentialOfferScreen;
