import { BackupScreen, TextInput } from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { translate } from '../../i18n';
import {
  CreateBackupNavigationProp,
  CreateBackupRouteProp,
} from '../../navigators/create-backup/create-backup-routes';

const CheckPasswordScreen: FC = () => {
  const navigation =
    useNavigation<CreateBackupNavigationProp<'CheckPassword'>>();
  const {
    params: { password },
  } = useRoute<CreateBackupRouteProp<'CheckPassword'>>();

  const [entry, setEntry] = useState('');
  const [error, setError] = useState<string>();
  useEffect(() => {
    setError(undefined);
  }, [entry]);

  const onConfirm = useCallback(() => {
    if (entry === password) {
      navigation.navigate('Processing', {
        params: { password },
        screen: 'Preview',
      });
    } else {
      setError(translate('createBackup.checkPassword.errorNoMatch'));
    }
  }, [entry, navigation, password]);

  return (
    <BackupScreen
      cta={translate('createBackup.checkPassword.cta')}
      description={translate('createBackup.checkPassword.description')}
      isCtaDisabled={!entry}
      onBack={navigation.goBack}
      onCta={onConfirm}
      testID="CreateBackupCheckPasswordScreen"
      title={translate('createBackup.checkPassword.title')}
    >
      <TextInput
        error={error}
        label={translate('createBackup.checkPassword.password')}
        onAccessoryPress={() => setEntry('')}
        onChangeText={setEntry}
        onSubmit={onConfirm}
        secureTextEntry
        testID="CreateBackupCheckPasswordScreen.input.password"
        value={entry}
      />
    </BackupScreen>
  );
};

export default CheckPasswordScreen;
