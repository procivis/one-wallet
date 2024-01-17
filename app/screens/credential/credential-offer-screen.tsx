import {
  Accordion,
  ActivityIndicator,
  SharingScreen,
  SharingScreenVariation,
  TextAvatar,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Claim } from '../../components/credential/claim';
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
import { reportException } from '../../utils/reporting';

const CredentialOfferScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const issuanceNavigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const { credentialId, interactionId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);
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

  return credential ? (
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
        <View style={styles.claims}>
          {credential.claims.map((claim, index, { length }) => (
            <Claim claim={claim} key={claim.id} last={length === index + 1} />
          ))}
        </View>
      </Accordion>
    </SharingScreen>
  ) : (
    <ActivityIndicator />
  );
};

const styles = StyleSheet.create({
  claims: {
    paddingBottom: 12,
  },
});

export default CredentialOfferScreen;
