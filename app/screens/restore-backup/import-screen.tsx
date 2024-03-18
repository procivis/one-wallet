import { FileInput } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import { DocumentDirectoryPath, moveFile } from 'react-native-fs';

import { BackupScreen } from '../../components/backup/backup-screen';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { reportException } from '../../utils/reporting';

const ImportScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Preview'>>();
  const [selectedFile, setSelectedFile] = useState<DocumentPickerResponse>();
  const [selectedFilePath, setSelectedFilePath] = useState<string>();

  const handleAddPress = async () => {
    try {
      const file = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.zip,
      });
      const filePath = `${DocumentDirectoryPath}/${file.name}`;
      await moveFile(file.uri, filePath);
      setSelectedFile(file);
      setSelectedFilePath(filePath);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        reportException(e, 'File selection failure');
      }
    }
  };

  const handleDeletePress = () => setSelectedFile(undefined);

  return (
    <BackupScreen
      cta={translate('restoreBackup.import.cta')}
      description={translate('restoreBackup.import.description')}
      isCtaDisabled={!selectedFilePath}
      onCta={() =>
        navigation.navigate('RecoveryPassword', {
          inputPath: selectedFilePath!,
        })
      }
      screenTitle={translate('restoreBackup.title')}
      testID="RestoreBackupImportScreen"
      title={translate('restoreBackup.import.title')}
    >
      <FileInput
        files={selectedFile ? [selectedFile] : []}
        label={translate('restoreBackup.import.importBackup')}
        onAddPress={handleAddPress}
        onDeletePress={handleDeletePress}
      />
    </BackupScreen>
  );
};

export default ImportScreen;
