import { BackupScreen, TextInput } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';

import { PasswordStrength } from '../../components/common/password-strength';
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
      cta={translate('common.setPassword')}
      description={translate('info.createBackup.setPassword.description')}
      isCtaDisabled={!password}
      onBack={navigation.goBack}
      onCta={onConfirm}
      testID="CreateBackupSetPasswordScreen"
      title={translate('common.addBackupPassword')}
    >
      <TextInput
        label={translate('common.password')}
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
