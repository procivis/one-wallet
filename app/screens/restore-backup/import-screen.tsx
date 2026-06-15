import {
  BackupScreen,
  ImportIcon,
  SettingsButton,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';

import useDocumentPicker from '../../hooks/document-picker';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';

const ImportScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RestoreBackupNavigationProp<'Import'>>();
  const { selectedDocumentPath, pickDocument, selectedDocument } =
    useDocumentPicker({
      pickOptions: { type: types.zip },
    });

  return (
    <BackupScreen
      cta={translate('common.import')}
      description={translate('info.restoreBackup.import.description')}
      isCtaDisabled={!selectedDocumentPath}
      onBack={navigation.goBack}
      onCta={() =>
        navigation.navigate('RecoveryPassword', {
          inputPath: selectedDocumentPath!,
        })
      }
      testID="RestoreBackupImportScreen"
      title={translate('common.restoreWalletBackup')}
    >
      <SettingsButton
        accessory={<ImportIcon color={colorScheme.text} />}
        onPress={() => {
          pickDocument();
        }}
        testID="RestoreBackupImportScreen.file"
        title={selectedDocument?.name ?? translate('common.selectBackupFile')}
      />
    </BackupScreen>
  );
};

export default ImportScreen;
