import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ActivityIndicator,
  Badge,
  Button,
  ButtonType,
  concatTestID,
  CredentialCardShadow,
  CredentialDetailsCard,
  detailsCardFromCredential,
  GhostButton,
  HistoryListItemView,
  ListItemView,
  ScrollViewScreen,
  TrustInfo,
  Typography,
  useAppColorScheme,
  useCoreConfig,
  useCredentialCardExpanded,
  useCredentialDetail,
  useCredentialTrustInformation,
  useHistory,
  useOrganisationDetail,
} from '@procivis/one-react-native-components';
import {
  CredentialState,
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

import { RefreshIcon } from '../../components/icon/refresh-icon';
import {
  HeaderBackButton,
  HeaderOptionsButton,
} from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCurrentLanguage } from '../../hooks/language';
import { useCredentialStatusCheck } from '../../hooks/revocation/credential-status';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { historyListActionsFilter } from '../../models/core/history';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { historyListItemLabels } from '../../utils/history';
import { trustInfoLabels } from '../../utils/trust-info';

const CredentialDetailScreen: FC = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'Detail'>>();
  const cardWidth = useMemo(() => Dimensions.get('window').width - 32, []);
  const language = useCurrentLanguage();
  const colorScheme = useAppColorScheme();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();

  const { credentialId } = route.params;
  const isFocused = useIsFocused();
  const { data: orgDetail } = useOrganisationDetail();
  const { data: credential } = useCredentialDetail(credentialId, isFocused);
  const { data: trustInformation } = useCredentialTrustInformation(
    featureFlags?.ecosystemsEnabled ? credentialId : undefined,
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

  const trustDetailsPressHandler = useCallback(() => {
    if (!credential?.trustInformation || !trustInformation) {
      return;
    }
    rootNavigation.navigate('TrustInfo', {
      result: credential?.trustInformation.result,
      trustInformation: trustInformation.issuer,
    });
  }, [rootNavigation, credential, trustInformation]);

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

  const title =
    credential.schema.translations?.name[language] ?? credential.schema.name;

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
            {credential.type === CredentialType.BATCH_PARENT &&
              credential.remainingBatchItemCount !== undefined && (
                <GhostButton
                  accessibilityLabel={translate('common.refreshCredential')}
                  disabled={credential.state !== CredentialState.ACCEPTED}
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
        title,
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
          lessLabel={translate('common.less')}
          moreLabel={translate('common.more')}
          onImagePreview={onImagePreview}
          showAllButtonLabel={translate('common.seeAll')}
          showLessButtonLabel={translate('common.seeLess')}
          testID={testID}
        />
      </View>
      <View style={styles.history}>
        <Typography
          accessibilityRole="header"
          color={colorScheme.text}
          preset="m"
          style={styles.sectionTitle}
        >
          {translate('common.issuer')}
        </Typography>
        <View style={styles.historyLog} testID="CredentialDetailScreen.issuer">
          <TrustInfo
            labels={trustInfoLabels()}
            language={language}
            onPress={trustDetailsPressHandler}
            style={[styles.issuer, { backgroundColor: colorScheme.white }]}
            testID={concatTestID(testID, 'trustInfo')}
            translate={
              orgDetail?.configuration?.enforceEcosystemAsHolder === false
            }
            trustInformation={
              credential?.trustInformation && trustInformation
                ? {
                    identifier: trustInformation.verifier?.value[0]?.identifier,
                    name:
                      credential.trustInformation.name ??
                      trustInformation.verifier?.value[0]?.name,
                    result: credential.trustInformation.result,
                  }
                : undefined
            }
          />
        </View>
      </View>
      {credential.type === CredentialType.BATCH_PARENT &&
        credential.remainingBatchItemCount !== undefined && (
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
              {credential.schema.formats.map((format, index, { length }) => {
                if (!credential.remainingBatchItemCount?.[format.format]) {
                  return undefined;
                }
                return (
                  <ListItemView
                    accessory={
                      <Badge
                        value={credential.remainingBatchItemCount[
                          format.format
                        ].toString()}
                      />
                    }
                    first={index === 0}
                    icon={
                      <View
                        style={[
                          styles.avatarPlaceholder,
                          { backgroundColor: colorScheme.background },
                        ]}
                      >
                        <Typography
                          color={colorScheme.black}
                          numberOfLines={1}
                          preset="s/line-height-small"
                          style={styles.avatarPlaceholderText}
                        >
                          {format.format
                            .split(' ')[0]
                            .split('_')[0]
                            .substring(0, 3)}
                        </Typography>
                      </View>
                    }
                    key={format.format}
                    label={format.format}
                    last={index === length - 1}
                  />
                );
              })}
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
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarPlaceholderText: {
    textTransform: 'uppercase',
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
  issuer: {
    borderRadius: 16,
    marginBottom: 16,
    paddingLeft: 16,
    paddingVertical: 16,
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
