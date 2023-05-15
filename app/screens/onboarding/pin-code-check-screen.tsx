import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { useBiometricType } from '../../components/pin-code/biometric';
import { usePinCodeValidation } from '../../components/pin-code/pin-code';
import PinCodeScreenContent, { PinCodeScreenActions } from '../../components/pin-code/pin-code-screen-content';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { hideSplashScreen } from '../../navigators/root/initialRoute';
import { RootNavigationProp, RootRouteProp } from '../../navigators/root/root-navigator-routes';

const hideSplashAndroidOnly = () => (Platform.OS === 'android' ? hideSplashScreen() : undefined);

const PinCodeCheckScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeCheck'>>();
  const route = useRoute<RootRouteProp<'PinCodeCheck'>>();
  const screen = useRef<PinCodeScreenActions>(null);

  useFocusEffect(hideSplashAndroidOnly);

  useBlockOSBackNavigation();

  const biometry = useBiometricType();
  const { userSettings } = useStores();

  const [error, setError] = useState<string>();

  const validatePin = usePinCodeValidation();

  const onCheckPassed = useCallback(() => {
    // the entry was correct (biometric or manual) -> hide the lock screen
    navigation.pop();
  }, [navigation]);

  const onPinEntered = useCallback(
    (userEntry: string) => {
      if (validatePin(userEntry)) {
        onCheckPassed();
      } else {
        setError(translate('onboarding.pinCodeScreen.check.error'));
        screen.current?.clearEntry();
      }
    },
    [onCheckPassed, validatePin],
  );

  const biometricCheckAllowed = userSettings.biometricLogin && !route.params?.disableBiometry;
  const biometryProps = biometry && biometricCheckAllowed ? { biometry, onBiometryPassed: onCheckPassed } : {};

  return (
    <PinCodeScreenContent
      ref={screen}
      onPinEntered={onPinEntered}
      {...biometryProps}
      title={translate('onboarding.pinCodeScreen.check.title')}
      instruction={translate('onboarding.pinCodeScreen.check.subtitle')}
      error={error}
    />
  );
};

export default PinCodeCheckScreen;
