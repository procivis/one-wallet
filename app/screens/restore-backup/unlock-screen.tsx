import {
  LoaderViewState,
  LoadingResultScreen,
} from '@procivis/one-react-native-components';
import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FC, useCallback, useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { unlink } from 'react-native-fs';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useUnpackBackup } from '../../hooks/core/backup';
import { translate } from '../../i18n';
import {
  RestoreBackupProcessingNavigationProp,
  RestoreBackupProcessingRouteProp,
} from '../../navigators/restore-backup/restore-backup-processing-routes';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { reportException } from '../../utils/reporting';

const UnlockScreen: FC = () => {
  const isFocused = useIsFocused();
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
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          navigation.navigate({
            merge: true,
            name: 'RecoveryPassword',
            params: { error: true, inputPath },
          });
        }, 300);
      });
    }
  }, [navigation, processingNavigation, route.params, unpackBackup]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      handleBackupUnlock();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <LoadingResultScreen
      header={{
        leftItem: <HeaderCloseModalButton onPress={onClose} />,
        modalHandleVisible: Platform.OS === 'ios',
        title: translate('restoreBackup.unlock.title'),
      }}
      loader={{
        animate: isFocused,
        label: translate(`restoreBackup.unlock.unlocking`),
        state: LoaderViewState.InProgress,
        testID: 'RestoreBackupUnlockScreen.animation',
      }}
      testID="RestoreBackupUnlockScreen"
    />
  );
};

export default UnlockScreen;
