import { BackupScreen } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';

import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';

const DashboardScreen: FC = () => {
  const navigation =
    useNavigation<RestoreBackupNavigationProp<'RestoreBackupDashboard'>>();

  return (
    <BackupScreen
      cta={translate('restoreBackup.dashboard.cta')}
      description={translate('restoreBackup.dashboard.description')}
      onBack={navigation.goBack}
      onCta={() => navigation.navigate('Import')}
      testID="RestoreBackupDashboardScreen"
      title={translate('restoreBackup.dashboard.title')}
    />
  );
};

export default DashboardScreen;
