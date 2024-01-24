import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';

import PinCodeSet from '../../components/pin-code/pin-code-set';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const PinCodeSetScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'PinCodeChange'>>();

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <PinCodeSet
      onClose={onClose}
      subtitle={translate('wallet.settings.security.pinCodeSet.description')}
      title={translate('wallet.settings.security.pinCodeSet.title')}
    />
  );
};

export default PinCodeSetScreen;
