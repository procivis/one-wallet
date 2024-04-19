import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';

import { BackupScreen } from '../../components/backup/backup-screen';
import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { useBackupInfo } from '../../hooks/core/backup';
import { useCredentials } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import {
  CreateBackupNavigationProp,
  CreateBackupRouteProp,
} from '../../navigators/create-backup/create-backup-routes';

const PreviewScreen: FC = () => {
  const navigation = useNavigation<CreateBackupNavigationProp<'Preview'>>();
  const { params } = useRoute<CreateBackupRouteProp<'Preview'>>();
  const { data: credentials } = useCredentials();
  const { data: backupInfo } = useBackupInfo();
  const nonExportableCredentials = backupInfo?.credentials;

  const exportableCredentials = credentials?.filter(
    (credential) =>
      !nonExportableCredentials?.find(
        (nonExportableCredential) =>
          nonExportableCredential.id === credential.id,
      ),
  );

  return (
    <BackupScreen
      cta={translate('createBackup.preview.cta')}
      description={translate('createBackup.preview.description')}
      onCta={() => navigation.navigate('Processing', params)}
      testID="CreateBackupPreviewScreen"
      title={translate('createBackup.preview.title')}
    >
      <PreviewCredentials
        credentials={exportableCredentials}
        fullWidth
        title={translate('createBackup.preview.backedUp')}
      />

      <PreviewCredentials
        credentials={nonExportableCredentials}
        fullWidth
        title={translate('createBackup.preview.notBackedUp')}
      />
    </BackupScreen>
  );
};

export default PreviewScreen;
