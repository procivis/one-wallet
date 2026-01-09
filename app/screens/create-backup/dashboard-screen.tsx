import {
  BackupScreen,
  formatDateTimeLocalized,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useHistory,
} from '@procivis/one-react-native-components';
import { HistoryEntityTypeBindingEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { CreateBackupNavigationProp } from '../../navigators/create-backup/create-backup-routes';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';

const DashboardScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<CreateBackupNavigationProp<'CreateBackupDashboard'>>();
  const settingsNavigation = useNavigation<SettingsNavigationProp>();
  const { data: historyData } = useHistory({
    entityTypes: [HistoryEntityTypeBindingEnum.BACKUP],
    pageSize: 1,
  });
  const lastBackupEntry = historyData?.pages?.[0]?.values?.[0];

  const handleItemPress = useCallback(() => {
    settingsNavigation.navigate('History', {
      params: {
        entry: lastBackupEntry!,
      },
      screen: 'Detail',
    });
  }, [lastBackupEntry, settingsNavigation]);

  return (
    <BackupScreen
      cta={translate('common.createNewBackup')}
      description={translate('info.createBackup.dashboard.description')}
      onBack={navigation.goBack}
      onCta={() => navigation.navigate('SetPassword')}
      testID="CreateBackupDashboardScreen"
      title={translate('info.createBackup.dashboard.title')}
    >
      <Typography
        accessibilityRole="header"
        color={colorScheme.text}
        preset="m"
        style={styles.sectionHeader}
      >
        {translate('common.lastBackup')}
      </Typography>
      <View style={[styles.item, { backgroundColor: colorScheme.background }]}>
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
                {formatDateTimeLocalized(new Date(lastBackupEntry.createdDate))}
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
              {translate('common.noBackups')}
            </Typography>
            <Typography
              align="center"
              color={colorScheme.text}
              preset="s/line-height-small"
              style={styles.shaded}
            >
              {translate('info.createBackup.dashboard.empty.subtitle')}
            </Typography>
          </View>
        )}
      </View>
    </BackupScreen>
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
