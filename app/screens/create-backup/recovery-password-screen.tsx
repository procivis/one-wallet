import { Input } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';

import { BackupScreen } from '../../components/backup/backup-screen';
import { translate } from '../../i18n';
import { CreateBackupNavigationProp } from '../../navigators/create-backup/create-backup-routes';

const RecoveryPasswordScreen: FC = () => {
  const navigation =
    useNavigation<CreateBackupNavigationProp<'RecoveryPassword'>>();
  const [values, setValues] = useState({
    password: '',
    passwordConfirmation: '',
  });

  return (
    <BackupScreen
      cta={translate('createBackup.recoveryPassword.cta')}
      description={translate('createBackup.recoveryPassword.description')}
      isCtaDisabled={
        !values.password || values.password !== values.passwordConfirmation
      }
      onCta={() =>
        navigation.navigate('Preview', {
          recoveryPassword: values.password,
        })
      }
      testID="CreateBackupRecoveryPasswordScreen"
      title={translate('createBackup.recoveryPassword.title')}
    >
      <Input
        label={translate('createBackup.recoveryPassword.password')}
        onAccessoryPress={() => setValues({ ...values, password: '' })}
        onChangeText={(password) => setValues({ ...values, password })}
        secureTextEntry
        testID="CreateBackupRecoveryPasswordScreen.input.password"
        value={values.password}
      />

      <Input
        label={translate('createBackup.recoveryPassword.reenterPassword')}
        onAccessoryPress={() =>
          setValues({ ...values, passwordConfirmation: '' })
        }
        onChangeText={(passwordConfirmation) =>
          setValues({ ...values, passwordConfirmation })
        }
        secureTextEntry
        testID="CreateBackupRecoveryPasswordScreen.input.reenterPassword"
        value={values.passwordConfirmation}
      />
    </BackupScreen>
  );
};

export default RecoveryPasswordScreen;
