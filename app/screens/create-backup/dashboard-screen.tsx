import {
  FlatListView,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { HistoryEntityTypeEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { NativeModules, Platform, StyleSheet } from 'react-native';
import { unlink } from 'react-native-fs';
import Share from 'react-native-share';

import { BackupScreen } from '../../components/backup/backup-screen';
import { Section } from '../../components/common/section';
import { NextIcon } from '../../components/icon/common-icon';
import { useHistory } from '../../hooks/core/history';
import { translate } from '../../i18n';
import {
  CreateBackupNavigationProp,
  CreateBackupRouteProp,
} from '../../navigators/create-backup/create-backup-routes';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';
import { reportException } from '../../utils/reporting';

const DashboardScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<CreateBackupNavigationProp<'Dashboard'>>();
  const settingsNavigation = useNavigation<SettingsNavigationProp>();
  const { params } = useRoute<CreateBackupRouteProp<'Dashboard'>>();
  const { data: historyData } = useHistory({
    entityTypes: [HistoryEntityTypeEnum.BACKUP],
    pageSize: 1,
  });
  const lastBackupEntry = historyData?.pages?.[0]?.values?.[0];

  const items = useMemo(() => {
    if (!lastBackupEntry) {
      return [];
    }
    return [
      {
        rightAccessory: <NextIcon color={colorScheme.text} />,
        subtitle: formatTimestamp(new Date(lastBackupEntry.createdDate)),
        testID: 'CreateBackupDashboardScreen.history',
        title: getEntryTitle(lastBackupEntry),
      },
    ];
  }, [colorScheme.text, lastBackupEntry]);

  const handleItemPress = useCallback(() => {
    settingsNavigation.navigate('History', {
      params: {
        entry: lastBackupEntry!,
      },
      screen: 'Detail',
    });
  }, [lastBackupEntry, settingsNavigation]);

  const handleSaveFile = useCallback(async () => {
    if (!params) {
      return;
    }

    const { backupFileName, backupFilePath } = params;

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
        await NativeModules.FileExporter.export({
          filename,
          mimeType,
          url,
        });
        success = true;
      }
      if (success) {
        await unlink(backupFilePath);
        navigation.replace('Dashboard');
      }
    } catch (e) {
      reportException(e, 'Backup move failure');
    }
  }, [navigation, params]);

  useEffect(() => {
    handleSaveFile();
  }, [handleSaveFile]);

  return (
    <BackupScreen
      cta={translate('createBackup.dashboard.cta')}
      description={translate('createBackup.dashboard.description')}
      onCta={() => navigation.navigate('RecoveryPassword')}
      testID="CreateBackupDashboardScreen"
      title={translate('createBackup.dashboard.title')}
    >
      <Section
        style={styles.noHorizontalPadding}
        title={translate('createBackup.dashboard.lastBackup')}
      >
        <FlatListView
          emptyListSubtitle={translate('createBackup.dashboard.empty.subtitle')}
          emptyListTitle={translate('createBackup.dashboard.empty.title')}
          items={items}
          onItemSelected={handleItemPress}
          style={styles.noHorizontalPadding}
        />
      </Section>
    </BackupScreen>
  );
};

const styles = StyleSheet.create({
  noHorizontalPadding: {
    paddingHorizontal: 0,
  },
});

export default DashboardScreen;
