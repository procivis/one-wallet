import {
  PinLockModal,
  reportTraceInfo,
  useBlockOSBackNavigation,
  usePinCodeSecurity,
} from '@procivis/one-react-native-components';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, DeviceEventEmitter, Platform } from 'react-native';
import { RESULTS } from 'react-native-permissions';

import PinCodeScreenContent, {
  PinCodeActions,
} from '../../components/pin-code/pin-code-screen-content';
import { config } from '../../config';
import { useInitialDeepLinkHandling } from '../../hooks/navigation/deep-link';
import {
  biometricAuthenticate,
  useBiometricType,
  useFaceIDPermission,
} from '../../hooks/pin-code/biometric';
import { usePinCodeValidation } from '../../hooks/pin-code/pin-code';
import { PIN_CODE_CHECK_ACTIVE_EVENT } from '../../hooks/pin-code/pin-code-check';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { hideSplashScreen } from '../../navigators/root/initialRoute';
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { pinLockModalLabels } from '../../utils/pinLock';
import { useWalletUnitAttestation } from '../settings/wallet-unit-attestation-screen';

const hideSplashAndroidOnly = () =>
  Platform.OS === 'android' ? hideSplashScreen() : undefined;

const PinCodeCheckScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'PinCodeCheck'>>();
  const route = useRoute<RootRouteProp<'PinCodeCheck'>>();
  const screen = useRef<PinCodeActions>(null);
  const { data: walletUnitAttestation } = useWalletUnitAttestation();

  useFocusEffect(hideSplashAndroidOnly);

  useBlockOSBackNavigation();

  const biometry = useBiometricType();
  const {
    userSettings: {
      biometrics,
      pinCodeSecurity: { failedAttempts, lastAttemptTimestamp },
      setPinCodeSecurity,
    },
  } = useStores();

  const [error, setError] = useState<string>();

  const validatePin = usePinCodeValidation();
  const { addFailedAttempt, blockRemainingTime, isBlocked, resetPinSecurity } =
    usePinCodeSecurity(
      failedAttempts,
      lastAttemptTimestamp,
      setPinCodeSecurity,
    );

  const handleInitialDeepLink = useInitialDeepLinkHandling();
  const onCheckPassed = useCallback(() => {
    // the entry was correct (biometric or manual) -> hide the lock screen
    navigation.pop();
    if (
      config.walletProvider.required &&
      walletUnitAttestation?.status === undefined
    ) {
      navigation.navigate('Onboarding', {
        screen: 'WalletUnitAttestation',
      });
    }
    handleInitialDeepLink();
  }, [handleInitialDeepLink, navigation, walletUnitAttestation?.status]);

  const onPinEntered = useCallback(
    (userEntry: string) => {
      if (validatePin(userEntry)) {
        onCheckPassed();
        resetPinSecurity();
      } else {
        setError(translate('info.onboarding.pinCodeScreen.check.error'));
        screen.current?.clearEntry();
        screen.current?.shakeKeypad();
        addFailedAttempt();
      }
    },
    [addFailedAttempt, onCheckPassed, resetPinSecurity, validatePin],
  );

  const faceIdPermissions = useFaceIDPermission();
  const biometricCheckEnabled = Boolean(
    biometry &&
      faceIdPermissions.status &&
      faceIdPermissions.status !== RESULTS.BLOCKED &&
      biometrics &&
      !route.params?.disableBiometry,
  );

  const runBiometricCheck = useCallback(() => {
    if (isBlocked) {
      return;
    }
    biometricAuthenticate({
      cancelLabel: translate('common.usePinCode'),
      promptMessage: translate('common.verifyYourIdentity'),
    })
      .then(() => {
        onCheckPassed();
        resetPinSecurity();
      })
      .catch((e: Error) => {
        reportTraceInfo('Wallet', 'Biometric login failed', e);
      });
  }, [isBlocked, onCheckPassed, resetPinSecurity]);

  useEffect(() => {
    if (biometricCheckEnabled) {
      const transitionUnsubscribe = navigation.addListener(
        'transitionEnd',
        () => {
          if (AppState.currentState === 'active') {
            runBiometricCheck();
          }
        },
      );

      const checkActiveSubscription = DeviceEventEmitter.addListener(
        PIN_CODE_CHECK_ACTIVE_EVENT,
        runBiometricCheck,
      );

      return () => {
        transitionUnsubscribe();
        checkActiveSubscription.remove();
      };
    }
    return undefined;
  }, [biometricCheckEnabled, navigation, runBiometricCheck]);

  return (
    <>
      <PinCodeScreenContent
        biometry={biometricCheckEnabled ? biometry : undefined}
        error={error}
        instruction={translate('onboardingPinCodeScreen.check.subtitle')}
        onBiometricPress={runBiometricCheck}
        onPinEntered={onPinEntered}
        ref={screen}
        testID="PinCodeCheckScreen"
        title={translate('onboardingPinCodeScreen.check.title')}
      />
      <PinLockModal
        attempts={failedAttempts}
        labels={pinLockModalLabels()}
        open={isBlocked}
        seconds={blockRemainingTime}
      />
    </>
  );
};

export default PinCodeCheckScreen;
