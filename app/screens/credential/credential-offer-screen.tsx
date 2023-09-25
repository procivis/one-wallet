import {
  Accordion,
  ActivityIndicator,
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

import { useCredentialDetail, useCredentialReject } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

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
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const issuanceNavigation = useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();

  const { credentialId, interactionId } = route.params;

  const { data: credential } = useCredentialDetail(credentialId);

  const { mutateAsync: rejectCredential } = useCredentialReject();

  useBlockOSBackNavigation();

  const onIssuerDetail = useCallback(() => {
    issuanceNavigation.navigate('CredentialOfferDetail', { credentialId });
  }, [credentialId, issuanceNavigation]);

  const onReject = useCallback(() => {
    rejectCredential(interactionId).catch((e) => reportException(e, 'Reject credential offer failed'));
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [interactionId, rejectCredential, rootNavigation]);

  const onAccept = useCallback(() => {
    issuanceNavigation.navigate('Processing', { interactionId });
  }, [interactionId, issuanceNavigation]);

  return credential ? (
    <SharingScreen
      variation={SharingScreenVariation.Neutral}
      title={translate('credentialOffer.title')}
      contentTitle={translate('credentialOffer.credential')}
      cancelLabel={translate('credentialOffer.reject')}
      onCancel={onReject}
      submitLabel={translate('credentialOffer.accept')}
      onSubmit={onAccept}
      receiverTitle={translate('credentialDetail.credential.issuer')}
      receiverLabel={credential.issuerDid ?? ''}
      onDetail={onIssuerDetail}>
      <Accordion
        title={credential.schema.name}
        icon={{ component: <TextAvatar produceInitials={true} text={credential.schema.name} innerSize={48} /> }}>
        {credential.claims.map((claim, index, { length }) => (
          <DataItem key={claim.id} attribute={claim.key} value={claim.value} last={length === index + 1} />
        ))}
      </Accordion>
    </SharingScreen>
  ) : (
    <ActivityIndicator />
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
});

export default CredentialOfferScreen;
