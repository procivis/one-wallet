import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  CredentialCardRatio,
  CredentialCardShadow,
  CredentialDetailsCard,
  detailsCardFromCredential,
  GhostButton,
  HistoryListItemView,
  ListItemView,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
  useCoreConfig,
  useCredentialCardExpanded,
  useCredentialDetail,
  useCredentialSchemaDetail,
  useHistory,
} from '@procivis/one-react-native-components';
import {
  CredentialType,
  HistoryEntityType,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import Badge from '../../components/badge/badge';
import { RefreshIcon } from '../../components/icon/refresh-icon';
import {
  HeaderBackButton,
  HeaderOptionsButton,
} from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCurrentLanguage } from '../../hooks/language';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { historyListActionsFilter } from '../../models/core/history';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { historyListItemLabels } from '../../utils/history';

const CredentialDetailScreen: FC = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'Detail'>>();
  const cardWidth = useMemo(() => Dimensions.get('window').width - 32, []);
  const language = useCurrentLanguage();
  const colorScheme = useAppColorScheme();

  const { credentialId } = route.params;
  const isFocused = useIsFocused();
  const { data: credential } = useCredentialDetail(credentialId, isFocused);
  const { data: credentialSchema } = useCredentialSchemaDetail(
    credential?.schema.id,
    isFocused,
  );

  const { data: historyPages } = useHistory({
    actions: historyListActionsFilter,
    credentialId,
    entityTypes: [HistoryEntityType.CREDENTIAL, HistoryEntityType.PROOF],
  });
  const credentialHistory = historyPages?.pages.flatMap((page) => page.values);

  const { data: config } = useCoreConfig();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  useCredentialStatusCheck([credentialId]);

  const { showActionSheetWithOptions } = useActionSheet();
  const options = useMemo(
    () => ({
      cancelButtonIndex: 3,
      destructiveButtonIndex: 2,
      options: [
        translate('common.moreInformation'),
        translate('common.checkStatus'),
        translate('common.deleteCredential'),
        translate('common.close'),
      ],
    }),
    [],
  );

  const handleBatchRefresh = useCallback(() => {
    if (!credential?.interactionId) {
      return;
    }
    rootNavigation.navigate('CredentialRefresh', {
      credentialId,
      interactionId: credential?.interactionId,
    });
  }, [credentialId, rootNavigation, credential]);

  const handleStatusUpdateCheck = useCallback(() => {
    rootNavigation.navigate('CredentialStatusUpdateProcess', {
      credentialId,
    });
  }, [credentialId, rootNavigation]);

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
            handleStatusUpdateCheck();
            return;
          case 2:
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
      handleStatusUpdateCheck,
    ],
  );

  const onImagePreview = useCredentialImagePreview();

  const onSeeAllHistory = useCallback(() => {
    navigation.navigate('History', { credentialId });
  }, [credentialId, navigation]);

  const backButtonHandler = useCallback(() => {
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  if (!credential || !config) {
    return <ActivityIndicator animate={isFocused} />;
  }
  const testID = 'CredentialDetailScreen.detailsCard';
  const { card, attributes } = detailsCardFromCredential(
    credential,
    config,
    testID,
    credentialCardLabels(),
    language,
  );

  const badgeTop = Math.ceil(cardWidth / CredentialCardRatio) - 34;

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderBackButton
            onPress={backButtonHandler}
            testID="CredentialDetailScreen.header.back"
          />
        ),
        rightItem: (
          <View style={styles.headerRightItemWrapper}>
            {credentialSchema?.batchSize && (
              <GhostButton
                accessibilityLabel={translate('common.refreshCredential')}
                icon={
                  <RefreshIcon
                    color={colorScheme.text}
                    style={styles.refreshIcon}
                  />
                }
                onPress={handleBatchRefresh}
                testID="CredentialDetailScreen.header.refresh"
              />
            )}
            <HeaderOptionsButton
              accessibilityLabel={'common.settings'}
              onPress={onActions}
              testID="CredentialDetailScreen.header.action"
            />
          </View>
        ),
        testID: 'CredentialDetailScreen.header',
        title: credential.schema.name,
      }}
      scrollView={{
        testID: 'CredentialDetailScreen.scroll',
      }}
      testID="CredentialDetailScreen"
    >
      <View style={styles.credentialWrapper}>
        <CredentialDetailsCard
          attributes={attributes}
          card={{
            ...card,
            onHeaderPress,
            width: cardWidth,
          }}
          expanded={expanded}
          onImagePreview={onImagePreview}
          showAllButtonLabel={translate('common.seeAll')}
          testID={testID}
        />
        {credential.type === CredentialType.BATCH_PARENT &&
          credential.remainingBatchItemCount && (
            <Badge
              style={[styles.credentialBadge, { top: badgeTop }]}
              type="pill"
              value={credential.remainingBatchItemCount.toString()}
            />
          )}
      </View>
      {credential.type === CredentialType.BATCH_PARENT &&
        credential.remainingBatchItemCount && (
          <View style={styles.history}>
            <Typography
              accessibilityRole="header"
              color={colorScheme.text}
              preset="m"
              style={styles.sectionTitle}
            >
              {translate('common.credentials')}
            </Typography>
            <View
              style={styles.historyLog}
              testID="CredentialDetailScreen.credentials"
            >
              <ListItemView
                accessory={
                  <Badge
                    value={credential.remainingBatchItemCount.toString()}
                  />
                }
                first={true}
                icon={
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      { backgroundColor: colorScheme.background },
                    ]}
                  >
                    <Typography
                      color={colorScheme.black}
                      style={styles.avatarPlaceholderText}
                    >
                      {credential.schema.format.split(' ')[0].split('_')[0]}
                    </Typography>
                  </View>
                }
                label={credential.schema.format}
                last={true}
              />
            </View>
          </View>
        )}
      <HistorySection
        historyEntries={credentialHistory}
        onSeeAllHistory={onSeeAllHistory}
      />
    </ScrollViewScreen>
  );
};

const DISPLAYED_HISTORY_ITEMS = 3;
const HistorySection: FC<{
  historyEntries?: HistoryListItem[];
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
        style={styles.sectionTitle}
      >
        {translate('common.history')}
      </Typography>
      <View style={styles.historyLog} testID="CredentialDetailScreen.history">
        {previewHistoryItems.map((item, idx, { length }) => (
          <HistoryListItemView
            first={idx === 0}
            item={item}
            key={item.id}
            labels={historyListItemLabels()}
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
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  avatarPlaceholderText: {
    textTransform: 'uppercase',
  },
  credentialBadge: {
    position: 'absolute',
    right: 12,
  },
  credentialWrapper: {
    ...CredentialCardShadow,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  headerRightItemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
  },
  history: {
    marginHorizontal: 16,
  },
  historyLog: {
    marginBottom: 12,
  },
  refreshIcon: {
    transform: [{ scaleX: -1 }],
  },
  sectionTitle: {
    marginHorizontal: 4,
    marginVertical: 16,
  },
});

export default CredentialDetailScreen;
