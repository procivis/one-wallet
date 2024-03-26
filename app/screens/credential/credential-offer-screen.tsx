import { CredentialDetailsCard } from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  SharingScreen,
  SharingScreenVariation,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';
import { Insets, StyleSheet, View } from 'react-native';

import { HelpIcon } from '../../components/icon/navigation-icon';
import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialCardExpanded } from '../../hooks/credential-card/credential-card-expanding';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import {
  useCredentialDetail,
  useCredentialReject,
} from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { detailsCardFromCredential } from '../../utils/credential';
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
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  useBlockOSBackNavigation();

  const onIssuerDetail = useCallback(() => {
    issuanceNavigation.navigate('CredentialOfferDetail', { credentialId });
  }, [credentialId, issuanceNavigation]);

  const onReject = useCallback(() => {
    rejectCredential(interactionId).catch((e) =>
      reportException(e, 'Reject credential offer failed'),
    );
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [interactionId, rejectCredential, rootNavigation]);

  const onAccept = useCallback(() => {
    issuanceNavigation.navigate('Processing', { credentialId, interactionId });
  }, [credentialId, interactionId, issuanceNavigation]);

  const onImagePreview = useCredentialImagePreview();

  if (!credential) {
    return <ActivityIndicator />;
  }

  const { card, attributes } = detailsCardFromCredential(credential, config);

  return (
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
      <CredentialDetailsCard
        attributes={attributes}
        card={{
          ...card,
          onHeaderPress,
        }}
        expanded={expanded}
        onImagePreview={onImagePreview}
      />
    </SharingScreen>
  );
};

const styles = StyleSheet.create({
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
