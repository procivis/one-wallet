import {
  BackupScreen,
  colorWithAlphaComponent,
  formatDateTimeLocalized,
  LoaderView,
  LoaderViewState,
  reportException,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useHistory,
} from '@procivis/one-react-native-components';
import { HistoryEntityTypeEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  InteractionManager,
  NativeModules,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { unlink } from 'react-native-fs';
import Share from 'react-native-share';

import { translate } from '../../i18n';
import {
  CreateBackupNavigationProp,
  CreateBackupRouteProp,
} from '../../navigators/create-backup/create-backup-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';

const DashboardScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<CreateBackupNavigationProp<'CreateBackupDashboard'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
  const settingsNavigation = useNavigation<SettingsNavigationProp>();
  const { params } = useRoute<CreateBackupRouteProp<'CreateBackupDashboard'>>();
  const { data: historyData } = useHistory({
    entityTypes: [HistoryEntityTypeEnum.BACKUP],
    pageSize: 1,
  });
  const lastBackupEntry = historyData?.pages?.[0]?.values?.[0];
  const [isSaving, setIsSaving] = useState(false);

  const handleItemPress = useCallback(() => {
    settingsNavigation.navigate('History', {
      params: {
        entry: lastBackupEntry!,
      },
      screen: 'Detail',
    });
  }, [lastBackupEntry, settingsNavigation]);

  const handleSaveFile = useCallback(() => {
    if (!params) {
      return;
    }

    const { backupFileName, backupFilePath } = params;

    const saveBackup = async () => {
      try {
        const url = `file://${backupFilePath}`;
        const filename = backupFileName;
        const mimeType = 'application/zip';
        let success;
        if (Platform.OS === 'ios') {
          const shareResponse = await Share.open({
            failOnCancel: false,
            filename,
            type: mimeType,
            url,
          });
          success = shareResponse.success;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await NativeModules.FileExporter.export({
            filename,
            mimeType,
            url,
          });
          success = true;
        }
        if (success) {
          await unlink(backupFilePath);
          rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
        }
        setIsSaving(false);
      } catch (e) {
        setIsSaving(false);
        reportException(e, 'Backup move failure');
      }
    };
    setIsSaving(true);
    InteractionManager.runAfterInteractions(() => {
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          saveBackup();
        }, 500);
      } else {
        saveBackup();
      }
    });
  }, [rootNavigation, params]);

  useEffect(() => {
    handleSaveFile();
  }, [handleSaveFile]);

  const loaderBackgroundStyle = {
    backgroundColor: colorWithAlphaComponent(colorScheme.black, 0.5),
  };

  return (
    <>
      <BackupScreen
        cta={translate('createBackup.dashboard.cta')}
        description={translate('createBackup.dashboard.description')}
        onBack={navigation.goBack}
        onCta={() => navigation.navigate('SetPassword')}
        testID="CreateBackupDashboardScreen"
        title={translate('createBackup.dashboard.title')}
      >
        <Typography
          accessibilityRole="header"
          color={colorScheme.text}
          preset="m"
          style={styles.sectionHeader}
        >
          {translate('createBackup.dashboard.lastBackup')}
        </Typography>
        <View
          style={[styles.item, { backgroundColor: colorScheme.background }]}
        >
          {lastBackupEntry ? (
            <TouchableOpacity
              onPress={handleItemPress}
              style={styles.historyItem}
            >
              <View style={styles.left}>
                <Typography color={colorScheme.text} preset="s">
                  {getEntryTitle(lastBackupEntry)}
                </Typography>
                <Typography
                  color={colorScheme.text}
                  preset="s/line-height-small"
                  style={styles.shaded}
                >
                  {formatDateTimeLocalized(
                    new Date(lastBackupEntry.createdDate),
                  )}
                </Typography>
              </View>
              <Typography
                color={colorScheme.text}
                preset="s/line-height-small"
                style={[styles.shaded, styles.time]}
              >
                {formatTimestamp(new Date(lastBackupEntry.createdDate))}
              </Typography>
            </TouchableOpacity>
          ) : (
            <View style={styles.emtpy}>
              <Typography align="center" color={colorScheme.text} preset="s">
                {translate('createBackup.dashboard.empty.title')}
              </Typography>
              <Typography
                align="center"
                color={colorScheme.text}
                preset="s/line-height-small"
                style={styles.shaded}
              >
                {translate('createBackup.dashboard.empty.subtitle')}
              </Typography>
            </View>
          )}
        </View>
      </BackupScreen>
      {isSaving && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.loader,
            loaderBackgroundStyle,
          ]}
        >
          <LoaderView animate={true} state={LoaderViewState.InProgress} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  emtpy: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  historyItem: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 12,
  },
  item: {
    borderRadius: 12,
    paddingBottom: 12,
    paddingTop: 8,
  },
  left: {
    flex: 1,
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginHorizontal: 4,
    marginVertical: 16,
  },
  shaded: {
    opacity: 0.7,
  },
  time: {
    marginLeft: 12,
    marginRight: 8,
  },
});

export default DashboardScreen;
