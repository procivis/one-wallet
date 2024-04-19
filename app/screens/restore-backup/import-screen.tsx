import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {
  DocumentDirectoryPath,
  exists,
  moveFile,
  unlink,
} from 'react-native-fs';

import { BackupScreen } from '../../components/backup/backup-screen';
import { DownloadIcon } from '../../components/icon/common-icon';
import SettingsButton from '../../components/settings/settings-button';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { reportException } from '../../utils/reporting';

const ImportScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Import'>>();
  const [selectedFile, setSelectedFile] = useState<DocumentPickerResponse>();
  const [selectedFilePath, setSelectedFilePath] = useState<string>();

  const handleAddPress = async () => {
    try {
      const file = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.zip,
      });
      const fileName = file.name?.replace(/\s/g, '_');
      const filePath = `${DocumentDirectoryPath}/${fileName}`;
      if (await exists(filePath)) {
        await unlink(filePath);
      }
      await moveFile(decodeURI(file.uri), filePath);
      setSelectedFile(file);
      setSelectedFilePath(filePath);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        reportException(e, 'File selection failure');
      }
    }
  };

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
      testID="RestoreBackupImportScreen"
      title={translate('restoreBackup.import.title')}
    >
      <SettingsButton
        accessory={DownloadIcon}
        onPress={handleAddPress}
        testID="RestoreBackupImportScreen.file"
        title={
          selectedFile?.name ??
          translate('restoreBackup.import.selectBackupFile')
        }
      />
    </BackupScreen>
  );
};

export default ImportScreen;
