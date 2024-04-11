import { useActionSheet } from '@expo/react-native-action-sheet';
import { CredentialDetailsCard } from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  DetailScreen,
  formatDateTime,
  ListItem,
  RoundButton,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Section } from '../../components/common/section';
import { MoreIcon } from '../../components/icon/navigation-icon';
import { useCoreConfig } from '../../hooks/core/core-config';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useCredentialCardExpanded } from '../../hooks/credential-card/credential-card-expanding';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  detailsCardFromCredential,
  getValidityState,
  ValidityState,
} from '../../utils/credential';

const CredentialDetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'Detail'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  useCredentialStatusCheck([credentialId]);
  const validityState = getValidityState(credential);

  const { showActionSheetWithOptions } = useActionSheet();
  const options = useMemo(
    () => ({
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
      options: [
        translate('credentialDetail.action.delete'),
        translate('common.close'),
      ],
    }),
    [],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      translate('credentialDetail.action.delete.confirmation.title'),
      translate('credentialDetail.action.delete.confirmation.message'),
      [
        {
          isPreferred: true,
          style: 'cancel',
          text: translate('common.cancel'),
        },
        {
          onPress: () => {
            navigation.replace('DeleteProcessing', {
              credentialId,
            });
          },
          style: 'destructive',
          text: translate('common.delete'),
        },
      ],
      { cancelable: true },
    );
  }, [credentialId, navigation]);

  const onActions = useCallback(
    () =>
      showActionSheetWithOptions(options, (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            handleDelete();
            return;
          default:
            return;
        }
      }),
    [handleDelete, options, showActionSheetWithOptions],
  );

  const onImagePreview = useCredentialImagePreview();

  if (!credential) {
    return <ActivityIndicator />;
  }

  const { card, attributes } = detailsCardFromCredential(credential, config);

  return (
    <DetailScreen
      onBack={() => rootNavigation.navigate('Dashboard', { screen: 'Wallet' })}
      rightButton={
        <RoundButton
          accessibilityLabel={translate('credentialDetail.actions')}
          icon={MoreIcon}
          onPress={onActions}
          testID="CredentialDetailScreen.header.action"
        />
      }
      style={{ backgroundColor: colorScheme.background }}
      testID="CredentialDetailScreen"
      title={credential.schema.name}
    >
      <CredentialDetailsCard
        attributes={attributes}
        card={{
          ...card,
          onHeaderPress,
        }}
        expanded={expanded}
        onImagePreview={onImagePreview}
        style={styles.credential}
      />
      <Section title={translate('credentialDetail.log.title')}>
        <View style={styles.logTitlePadding} />
        {credential.lvvcIssuanceDate && (
          <ListItem
            rightAccessory={null}
            style={styles.logItem}
            subtitle={formatDateTime(new Date(credential.lvvcIssuanceDate))}
            testID="CredentialDetailScreen.log.validityUpdated"
            title={translate('credentialDetail.log.validityUpdated')}
          />
        )}
        {validityState === ValidityState.Suspended && (
          <ListItem
            rightAccessory={null}
            style={styles.logItem}
            subtitle={formatDateTime(new Date(credential.lastModified))}
            testID="CredentialDetailScreen.log.suspended"
            title={translate('credentialDetail.log.suspended')}
          />
        )}
        {credential.revocationDate && (
          <ListItem
            rightAccessory={null}
            style={styles.logItem}
            subtitle={formatDateTime(new Date(credential.revocationDate))}
            testID="CredentialDetailScreen.log.revoked"
            title={translate('credentialDetail.log.revoked')}
          />
        )}
        <ListItem
          rightAccessory={null}
          style={styles.logItem}
          subtitle={formatDateTime(new Date(credential.issuanceDate))}
          testID="CredentialDetailScreen.log.issued"
          title={translate('credentialDetail.log.issued')}
        />
      </Section>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 12,
  },
  logItem: {
    paddingHorizontal: 0,
  },
  logTitlePadding: {
    marginBottom: 12,
  },
});

export default CredentialDetailScreen;
