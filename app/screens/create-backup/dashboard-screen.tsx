import {
  FlatListView,
  formatDateTime,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import BackupScreen from '../../components/backup/backup-screen';
import { Section } from '../../components/common/section';
import { translate } from '../../i18n';
import { CreateBackupNavigationProp } from '../../navigators/create-backup/create-backup-routes';

const DashboardScreen: FC = () => {
  const navigation = useNavigation<CreateBackupNavigationProp<'Dashboard'>>();

  // TODO: replace with real data
  const lastBackup = {
    subtitle: formatDateTime(new Date()),
    title: translate('createBackup.dashboard.backupCreated'),
  };

  return (
    <BackupScreen
      cta={translate('createBackup.dashboard.cta')}
      description={translate('createBackup.dashboard.description')}
      onCta={() => navigation.navigate('RecoveryPassword')}
      screenTitle={translate('createBackup.title')}
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
          items={[lastBackup]}
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
