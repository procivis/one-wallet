import { ActivityIndicator, Input } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import { unlink } from 'react-native-fs';

import { BackupScreen } from '../../components/backup/backup-screen';
import { useUnpackBackup } from '../../hooks/core/backup';
import { translate } from '../../i18n';
import {
  RestoreBackupNavigationProp,
  RestoreBackupRouteProp,
} from '../../navigators/restore-backup/restore-backup-routes';
import { reportException } from '../../utils/reporting';

const RecoveryPasswordScreen: FC = () => {
  const navigation =
    useNavigation<RestoreBackupNavigationProp<'RecoveryPassword'>>();
  const route = useRoute<RestoreBackupRouteProp<'RecoveryPassword'>>();
  const { inputPath } = route.params;
  const {
    mutateAsync: unpackBackup,
    isLoading,
    isError,
    reset,
  } = useUnpackBackup();
  const [password, setPassword] = useState('');

  const handlePasswordTextChange = useCallback(
    (text: string) => {
      setPassword(text);
      reset();
    },
    [reset],
  );

  const handleCta = async () => {
    try {
      await unpackBackup({
        inputPath,
        password,
      });
      await unlink(inputPath);
      navigation.navigate('Preview');
    } catch (e) {
      reportException(e, 'Backup unpacking failure');
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <BackupScreen
      cta={translate('restoreBackup.recoveryPassword.cta')}
      description={translate('restoreBackup.recoveryPassword.description')}
      isCtaDisabled={!password || isError}
      onCta={handleCta}
      screenTitle={translate('restoreBackup.recoveryPassword.title')}
      testID="RestoreBackupRecoveryPasswordScreen"
      title={translate('restoreBackup.recoveryPassword.title')}
    >
      <Input
        error={
          isError
            ? translate('restoreBackup.recoveryPassword.wrongPassword')
            : ''
        }
        label={translate('restoreBackup.recoveryPassword.password')}
        onAccessoryPress={() => setPassword('')}
        onChangeText={handlePasswordTextChange}
        secureTextEntry
        value={password}
      />
    </BackupScreen>
  );
};

export default RecoveryPasswordScreen;
