import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';

import { BackupScreen } from '../../components/backup/backup-screen';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';

const DashboardScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Dashboard'>>();

  return (
    <BackupScreen
      cta={translate('restoreBackup.dashboard.cta')}
      description={translate('restoreBackup.dashboard.description')}
      onCta={() => navigation.navigate('Import')}
      screenTitle={translate('restoreBackup.title')}
      testID="RestoreBackupDashboardScreen"
      title={translate('restoreBackup.dashboard.title')}
    />
  );
};

export default DashboardScreen;
