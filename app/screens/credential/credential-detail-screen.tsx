import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  CredentialDetailsCard,
  DetailScreen,
  OptionsIcon,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  ActivityIndicator,
  Typography,
} from '@procivis/react-native-components';
import { HistoryActionEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import HistoryItem from '../../components/history/history-item';
import { useCoreConfig } from '../../hooks/core/core-config';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useHistory } from '../../hooks/core/history';
import { useCredentialCardExpanded } from '../../hooks/credential-card/credential-card-expanding';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { HistoryListItemWithDid } from '../../models/core/history';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { detailsCardFromCredential } from '../../utils/credential';

const CredentialDetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'Detail'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  // TODO Remove filtering by action type once ONE-2096 is resolved
  const { data: historyPages } = useHistory({
    action: HistoryActionEnum.ACCEPTED,
    credentialId: credentialId,
  });

  const credentialHistory = historyPages?.pages.flatMap((page) => page.values);

  const { data: config } = useCoreConfig();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  useCredentialStatusCheck([credentialId]);

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
      contentStyle={[
        {
          backgroundColor: colorScheme.background,
        },
        styles.credentialContainer,
      ]}
      headerProps={{
        onBack: () =>
          rootNavigation.navigate('Dashboard', { screen: 'Wallet' }),
        rightButton: (
          <TouchableOpacity
            accessibilityLabel={translate('wallet.settings')}
            onPress={onActions}
            style={styles.settingsButton}
            testID="WalletScreen.header.action-settings"
          >
            <OptionsIcon color={colorScheme.text} />
          </TouchableOpacity>
        ),
        text: {},
        title: credential.schema.name,
      }}
      testID="CredentialDetailScreen"
    >
      <CredentialDetailsCard
        attributes={attributes}
        card={{
          ...card,
          onHeaderPress,
        }}
        expanded={expanded}
        onImagePreview={onImagePreview}
        showAllButtonLabel={translate('common.seeAll')}
        style={styles.credential}
      />
      <HistorySection historyEntries={credentialHistory} />
    </DetailScreen>
  );
};

const HistorySection: FC<{
  historyEntries?: HistoryListItemWithDid[];
}> = ({ historyEntries }) => {
  const colorScheme = useAppColorScheme();

  const previewHistoryItems = (historyEntries ?? []).slice(0, 3);

  return (
    <React.Fragment>
      <Typography size="h2" style={styles.historySectionTitle}>
        {translate('history.title')}
      </Typography>
      <View style={[styles.historyLog, { backgroundColor: colorScheme.white }]}>
        {previewHistoryItems.map((historyItem, idx) => (
          <HistoryItem
            historyItem={historyItem}
            key={historyItem.id}
            last={idx === previewHistoryItems.length - 1}
          />
        ))}
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 12,
  },
  credentialContainer: {
    paddingHorizontal: 16,
  },
  historyLog: {
    borderRadius: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  historySectionTitle: {
    marginVertical: 12,
  },
  settingsButton: {
    height: 24,
    width: 24,
  },
});

export default CredentialDetailScreen;
