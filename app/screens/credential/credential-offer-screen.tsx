import {
  Accordion,
  ActivityIndicator,
  SharingScreen,
  SharingScreenVariation,
  TextAvatar,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';
import { Insets, StyleSheet, View } from 'react-native';

import { Claim } from '../../components/credential/claim';
import { HelpIcon } from '../../components/icon/navigation-icon';
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

const detailButtonHitslop: Insets = {
  bottom: 10,
  left: 10,
  right: 10,
  top: 10,
};

const CredentialOfferScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
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
      header={
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Typography
              accessibilityRole="header"
              bold={true}
              caps={true}
              size="sml"
              style={styles.headerLabel}
            >
              {translate('credentialDetail.credential.issuer')}
            </Typography>
            <TouchableOpacity
              accessibilityLabel={translate('common.info')}
              accessibilityRole="button"
              hitSlop={detailButtonHitslop}
              onPress={onIssuerDetail}
              style={[
                styles.detailButton,
                { backgroundColor: colorScheme.background },
              ]}
            >
              <HelpIcon />
            </TouchableOpacity>
          </View>
          <Typography
            color={colorScheme.text}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {credential.issuerDid}
          </Typography>
        </View>
      }
      onCancel={onReject}
      onSubmit={onAccept}
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
              shape="rect"
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
  detailButton: {
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  header: {
    padding: 12,
  },
  headerLabel: {
    marginBottom: 4,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

export default CredentialOfferScreen;
