import { useBlockOSBackNavigation } from '@procivis/react-native-components';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { biometricAuthenticate, useBiometricType } from '../../components/pin-code/biometric';
import { usePinCodeValidation } from '../../components/pin-code/pin-code';
import PinCodeScreenContent, { PinCodeActions } from '../../components/pin-code/pin-code-screen-content';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { hideSplashScreen } from '../../navigators/root/initialRoute';
import { RootNavigationProp, RootRouteProp } from '../../navigators/root/root-navigator-routes';
import { reportTraceInfo } from '../../utils/reporting';

const hideSplashAndroidOnly = () => (Platform.OS === 'android' ? hideSplashScreen() : undefined);

const PinCodeCheckScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeCheck'>>();
  const route = useRoute<RootRouteProp<'PinCodeCheck'>>();
  const screen = useRef<PinCodeActions>(null);

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
        screen.current?.shakeKeypad();
      }
    },
    [onCheckPassed, validatePin],
  );

  const biometricCheckEnabled = Boolean(biometry && userSettings.biometricLogin && !route.params?.disableBiometry);

  const runBiometricCheck = useCallback(() => {
    biometricAuthenticate({
      cancelLabel: translate('onboarding.pinCodeScreen.biometric.cancel'),
      promptMessage: translate('onboarding.pinCodeScreen.biometric.prompt'),
    })
      .then(() => onCheckPassed())
      .catch((e) => {
        reportTraceInfo('Wallet', 'Biometric login failed', e);
      });
  }, [onCheckPassed]);

  useEffect(() => {
    if (biometricCheckEnabled) {
      return navigation.addListener('transitionEnd', () => {
        if (AppState.currentState === 'active') {
          runBiometricCheck();
        }
      });
    }
    return undefined;
  }, [biometricCheckEnabled, navigation, runBiometricCheck]);

  return (
    <PinCodeScreenContent
      testID="PinCodeCheckScreen"
      ref={screen}
      onPinEntered={onPinEntered}
      title={translate('onboarding.pinCodeScreen.check.title')}
      instruction={translate('onboarding.pinCodeScreen.check.subtitle')}
      error={error}
      biometry={biometricCheckEnabled ? biometry : undefined}
      onBiometricPress={runBiometricCheck}
    />
  );
};

export default PinCodeCheckScreen;
