import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  CredentialCardShadow,
  CredentialDetailsCard,
  detailsCardFromCredential,
  HistoryListItemView,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
  useCoreConfig,
  useCredentialCardExpanded,
  useCredentialDetail,
  useHistory,
} from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeBindingEnum,
  HistoryListItemBindingDto,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import {
  HeaderBackButton,
  HeaderOptionsButton,
} from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
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
    useNavigation<RootNavigationProp<'CredentialDetailBindingDto'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'Detail'>>();
  const cardWidth = useMemo(() => Dimensions.get('window').width - 32, []);

  const { credentialId } = route.params;
  const isFocused = useIsFocused();
  const { data: credential } = useCredentialDetail(credentialId, isFocused);

  const { data: historyPages } = useHistory({
    actions: historyListActionsFilter,
    credentialId,
    entityTypes: [
      HistoryEntityTypeBindingEnum.CREDENTIAL,
      HistoryEntityTypeBindingEnum.PROOF,
    ],
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
        translate('common.refreshCredential'),
        translate('common.deleteCredential'),
        translate('common.close'),
      ],
    }),
    [],
  );

  const handleRefresh = useCallback(() => {
    rootNavigation.navigate('CredentialUpdateProcess', {
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
            handleRefresh();
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
      handleRefresh,
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
  );

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
          <HeaderOptionsButton
            accessibilityLabel={'common.settings'}
            onPress={onActions}
            testID="CredentialDetailScreen.header.action"
          />
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
      </View>
      <HistorySection
        historyEntries={credentialHistory}
        onSeeAllHistory={onSeeAllHistory}
      />
    </ScrollViewScreen>
  );
};

const DISPLAYED_HISTORY_ITEMS = 3;
const HistorySection: FC<{
  historyEntries?: HistoryListItemBindingDto[];
  onSeeAllHistory?: () => void;
}> = ({ historyEntries = [], onSeeAllHistory }) => {
  const colorScheme = useAppColorScheme();
  const previewHistoryItems = historyEntries.slice(0, DISPLAYED_HISTORY_ITEMS);
  const expandable = historyEntries.length > DISPLAYED_HISTORY_ITEMS;
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetailBindingDto'>>();

  const handleProofPress = useCallback(
    (entry: HistoryListItemBindingDto) => {
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
  credentialWrapper: {
    ...CredentialCardShadow,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  history: {
    marginHorizontal: 16,
  },
  historyLog: {
    marginBottom: 12,
  },
  historySectionTitle: {
    marginHorizontal: 4,
    marginVertical: 16,
  },
});

export default CredentialDetailScreen;
