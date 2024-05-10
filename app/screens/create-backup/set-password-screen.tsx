import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';

import { BackupScreen } from '../../components/backup/backup-screen';
import { PasswordStrength } from '../../components/common/password-strength';
import Input from '../../components/common/text-input';
import { translate } from '../../i18n';
import { CreateBackupNavigationProp } from '../../navigators/create-backup/create-backup-routes';

const SetPasswordScreen: FC = () => {
  const navigation = useNavigation<CreateBackupNavigationProp<'SetPassword'>>();
  const [password, setPassword] = useState('');

  const onConfirm = useCallback(() => {
    if (password) {
      navigation.navigate('CheckPassword', { password });
    }
  }, [navigation, password]);

  return (
    <BackupScreen
      cta={translate('createBackup.setPassword.cta')}
      description={translate('createBackup.setPassword.description')}
      isCtaDisabled={!password}
      onCta={onConfirm}
      testID="CreateBackupSetPasswordScreen"
      title={translate('createBackup.setPassword.title')}
    >
      <Input
        label={translate('createBackup.setPassword.password')}
        onAccessoryPress={() => setPassword('')}
        onChangeText={setPassword}
        onSubmit={onConfirm}
        secureTextEntry
        testID="CreateBackupSetPasswordScreen.input.password"
        value={password}
      />
      <PasswordStrength
        password={password}
        testID="CreateBackupSetPasswordScreen.strength"
      />
    </BackupScreen>
  );
};

export default SetPasswordScreen;
