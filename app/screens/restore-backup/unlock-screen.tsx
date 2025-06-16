import {
  LoaderViewState,
  reportException,
  useBlockOSBackNavigation,
  useUnpackBackup,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect } from 'react';
import { unlink } from 'react-native-fs';

import { ProcessingView } from '../../components/common/processing-view';
import { translate } from '../../i18n';
import {
  RestoreBackupProcessingNavigationProp,
  RestoreBackupProcessingRouteProp,
} from '../../navigators/restore-backup/restore-backup-processing-routes';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';

const UnlockScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Processing'>>();
  const processingNavigation =
    useNavigation<RestoreBackupProcessingNavigationProp<'Unlock'>>();
  const route = useRoute<RestoreBackupProcessingRouteProp<'Unlock'>>();
  const { mutateAsync: unpackBackup } = useUnpackBackup();

  useBlockOSBackNavigation();

  const handleBackupUnlock = useCallback(async () => {
    const { inputPath, password } = route.params;
    try {
      await unpackBackup({
        inputPath,
        password,
      });
      await unlink(inputPath);
      processingNavigation.replace('Preview');
    } catch (e) {
      reportException(e, 'Backup unpacking failure');
      navigation.navigate({
        merge: true,
        name: 'RecoveryPassword',
        params: { error: true, inputPath },
      });
    }
  }, [navigation, processingNavigation, route.params, unpackBackup]);

  useEffect(() => {
    handleBackupUnlock();
  }, [handleBackupUnlock]);

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ProcessingView
      button={false}
      loaderLabel={translate(`restoreBackup.unlock.unlocking`)}
      onClose={onClose}
      state={LoaderViewState.InProgress}
      testID="CredentialDeleRestoreBackupUnlockScreenteProcessScreen"
      title={translate('restoreBackup.unlock.title')}
    />
  );
};

export default UnlockScreen;
