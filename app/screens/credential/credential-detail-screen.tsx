import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  Button,
  ButtonType,
  concatTestID,
  CredentialDetailsCard,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HistoryItem } from '../../components/history/history-item';
import {
  HeaderBackButton,
  HeaderOptionsButton,
} from '../../components/navigation/header-buttons';
import ScrollViewScreen from '../../components/screens/scroll-view-screen';
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
            rootNavigation.navigate('NerdMode', {
              params: { credentialId },
              screen: 'CredentialNerdMode',
            });
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
      rootNavigation,
    ],
  );

  const onImagePreview = useCredentialImagePreview();

  const onSeeAllHistory = useCallback(() => {
    navigation.navigate('History', { credentialId });
  }, [credentialId, navigation]);

  const backButtonHandler = useCallback(() => {
    rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  if (!credential) {
    return <ActivityIndicator />;
  }
  const testID = 'CredentialDetailScreen.detailsCard';
  const { card, attributes } = detailsCardFromCredential(
    credential,
    config,
    testID,
  );

  return (
    <ScrollViewScreen
      header={{
        leftItem: <HeaderBackButton onPress={backButtonHandler} />,
        rightItem: (
          <HeaderOptionsButton
            accessibilityLabel={'wallet.settings'}
            onPress={onActions}
            testID={'CredentialDetailScreen.header.action'}
          />
        ),
        testID: 'CredentialDetailScreen.header',
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
    </ScrollViewScreen>
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
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();

  const handleProofPress = useCallback(
    (entry: HistoryListItem) => {
      rootNavigation.navigate('Settings', {
        params: {
          params: { entry },
          screen: 'Detail',
        },
        screen: 'History',
      });
    },
    [rootNavigation],
  );
  return (
    <View style={styles.history}>
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
            onPress={handleProofPress}
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
    </View>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  history: {
    marginHorizontal: 16,
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
});

export default CredentialDetailScreen;
