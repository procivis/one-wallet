import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  Button,
  ButtonType,
  concatTestID,
  CredentialDetailsCard,
  DetailScreen,
  OptionsIcon,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import { HistoryEntityTypeEnum } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { HistoryItem } from '../../components/history/history-item';
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
  const isFocused = useIsFocused();
  const { data: credential } = useCredentialDetail(credentialId, isFocused);

  const { data: historyPages } = useHistory({
    credentialId,
    entityTypes: [
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
  });
  const credentialHistory = historyPages?.pages.flatMap((page) => page.values);

  const { data: config } = useCoreConfig();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  useCredentialStatusCheck([credentialId]);

  const { showActionSheetWithOptions } = useActionSheet();
  const options = useMemo(
    () => ({
      cancelButtonIndex: 2,
      destructiveButtonIndex: 1,
      options: [
        translate('credentialDetail.action.moreInfo'),
        translate('credentialDetail.action.delete'),
        translate('common.close'),
      ],
    }),
    [],
  );

  const handleDelete = useCallback(() => {
    navigation.navigate('Delete', {
      params: { credentialId },
      screen: 'Prompt',
    });
  }, [credentialId, navigation]);

  const onActions = useCallback(
    () =>
      showActionSheetWithOptions(options, (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            navigation.navigate('CredentialNerdScreen', { credentialId });
            return;
          case 1:
            handleDelete();
            return;
          default:
            return;
        }
      }),
    [
      credentialId,
      handleDelete,
      options,
      showActionSheetWithOptions,
      navigation,
    ],
  );

  const onImagePreview = useCredentialImagePreview();

  const onSeeAllHistory = useCallback(() => {
    navigation.navigate('History', { credentialId });
  }, [credentialId, navigation]);

  if (!credential) {
    return <ActivityIndicator />;
  }
  const testID = 'CredentialDetailScreen.card';
  const { card, attributes } = detailsCardFromCredential(
    credential,
    config,
    testID,
  );

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
            testID="CredentialDetailScreen.header.action"
          >
            <OptionsIcon color={colorScheme.text} />
          </TouchableOpacity>
        ),
        testID: 'CredentialDetailScreen.header',
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
        testID={testID}
      />
      <HistorySection
        historyEntries={credentialHistory}
        onSeeAllHistory={onSeeAllHistory}
      />
    </DetailScreen>
  );
};

const DISPLAYED_HISTORY_ITEMS = 3;
const HistorySection: FC<{
  historyEntries?: HistoryListItemWithDid[];
  onSeeAllHistory?: () => void;
}> = ({ historyEntries = [], onSeeAllHistory }) => {
  const colorScheme = useAppColorScheme();
  const previewHistoryItems = historyEntries.slice(0, DISPLAYED_HISTORY_ITEMS);
  const expandable = historyEntries.length > DISPLAYED_HISTORY_ITEMS;

  return (
    <>
      <Typography
        accessibilityRole="header"
        color={colorScheme.text}
        preset="m"
        style={styles.historySectionTitle}
      >
        {translate('history.title')}
      </Typography>
      <View
        style={[styles.historyLog, { backgroundColor: colorScheme.white }]}
        testID="CredentialDetailScreen.history"
      >
        {previewHistoryItems.map((item, idx, { length }) => (
          <HistoryItem
            item={item}
            key={item.id}
            last={!expandable && idx === length - 1}
            testID={concatTestID(
              'CredentialDetailScreen.history',
              idx.toString(),
            )}
          />
        ))}
        {expandable && (
          <Button
            onPress={onSeeAllHistory}
            testID="CredentialDetailScreen.history.seeAll"
            title={translate('common.seeAll')}
            type={ButtonType.Secondary}
          />
        )}
      </View>
    </>
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
    marginHorizontal: 4,
    marginVertical: 16,
  },
  settingsButton: {
    height: 24,
    width: 24,
  },
});

export default CredentialDetailScreen;
