import { BackupScreen, TextInput } from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';

import { translate } from '../../i18n';
import {
  RestoreBackupNavigationProp,
  RestoreBackupRouteProp,
} from '../../navigators/restore-backup/restore-backup-routes';

const RecoveryPasswordScreen: FC = () => {
  const navigation =
    useNavigation<RestoreBackupNavigationProp<'RecoveryPassword'>>();
  const route = useRoute<RestoreBackupRouteProp<'RecoveryPassword'>>();
  const { inputPath } = route.params;
  const [password, setPassword] = useState('');

  const handlePasswordTextChange = useCallback(
    (text: string) => {
      setPassword(text);
      navigation.setParams({ error: false });
    },
    [navigation],
  );

  const handleCta = useCallback(() => {
    navigation.navigate('Processing', {
      params: { inputPath, password },
      screen: 'Unlock',
    });
  }, [inputPath, navigation, password]);

  return (
    <BackupScreen
      cta={translate('restoreBackup.recoveryPassword.cta')}
      description={translate('restoreBackup.recoveryPassword.description')}
      isCtaDisabled={!password || route.params.error}
      onBack={navigation.goBack}
      onCta={handleCta}
      testID="RestoreBackupRecoveryPasswordScreen"
      title={translate('restoreBackup.recoveryPassword.title')}
    >
      <TextInput
        error={
          route.params.error
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
