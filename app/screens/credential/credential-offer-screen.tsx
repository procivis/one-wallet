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

import { useCoreConfig } from '../../hooks/core-config';
import {
  useCredentialDetail,
  useCredentialReject,
} from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { formatClaimValue } from '../../utils/credential';
import { reportException } from '../../utils/reporting';

const DataItem: FunctionComponent<{
  attribute: string;
  last?: boolean;
  value: string;
}> = ({ attribute, value, last }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.dataItem,
        last && styles.dataItemLast,
        { borderColor: colorScheme.lighterGrey },
      ]}
    >
      <Typography
        color={colorScheme.textSecondary}
        size="sml"
        style={styles.dataItemLabel}
      >
        {attribute}
      </Typography>
      <Typography color={colorScheme.text}>{value}</Typography>
    </View>
  );
};

const CredentialOfferScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const issuanceNavigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const { credentialId, interactionId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();

  useBlockOSBackNavigation();

  const onIssuerDetail = useCallback(() => {
    issuanceNavigation.navigate('CredentialOfferDetail', { credentialId });
  }, [credentialId, issuanceNavigation]);

  const onReject = useCallback(() => {
    rejectCredential(interactionId).catch((e) =>
      reportException(e, 'Reject credential offer failed'),
    );
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [interactionId, rejectCredential, rootNavigation]);

  const onAccept = useCallback(() => {
    issuanceNavigation.navigate('Processing', { credentialId, interactionId });
  }, [credentialId, interactionId, issuanceNavigation]);

  return credential && config ? (
    <SharingScreen
      cancelLabel={translate('credentialOffer.reject')}
      contentTitle={translate('credentialOffer.credential')}
      onCancel={onReject}
      onDetail={onIssuerDetail}
      onSubmit={onAccept}
      receiverLabel={credential.issuerDid ?? ''}
      receiverTitle={translate('credentialDetail.credential.issuer')}
      submitLabel={translate('credentialOffer.accept')}
      testID="CredentialOfferScreen"
      title={translate('credentialOffer.title')}
      variation={SharingScreenVariation.Neutral}
    >
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
        {credential.claims.map((claim, index, { length }) => (
          <DataItem
            attribute={claim.key}
            key={claim.id}
            last={length === index + 1}
            value={formatClaimValue(claim, config)}
          />
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
