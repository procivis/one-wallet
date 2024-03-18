import { Checkbox } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackupScreen } from '../../components/backup/backup-screen';
import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { useRollbackImport } from '../../hooks/backup';
import { useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { reportException } from '../../utils/reporting';

const PreviewScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Preview'>>();
  const { data: credentials } = useCredentials();
  const { mutateAsync: rollbackImport } = useRollbackImport();
  const [isConsentChecked, setIsConsentChecked] = useState<boolean>(false);

  const handleBack = async () => {
    try {
      await rollbackImport();
    } catch (e) {
      reportException(e, 'Backup rollbacking failure');
    }
  };

  return (
    <BackupScreen
      cta={translate('restoreBackup.preview.cta')}
      description={translate('restoreBackup.preview.description')}
      isCtaDisabled={!isConsentChecked}
      onBack={handleBack}
      onCta={() => navigation.navigate('Processing')}
      screenTitle={translate('restoreBackup.title')}
      testID="RestoreBackupPreviewScreen"
      title={translate('restoreBackup.preview.title')}
    >
      <View style={styles.content}>
        <PreviewCredentials
          credentials={credentials}
          fullWidth
          title={translate('restoreBackup.preview.backedUp')}
        />

        <Checkbox
          onValueChanged={setIsConsentChecked}
          text={translate('restoreBackup.preview.consent')}
          value={isConsentChecked}
        />
      </View>
    </BackupScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
});

export default PreviewScreen;
