import { useInitializeONECoreIdentifiers } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';

import PinCodeScreenContent, {
  PinCodeActions,
} from '../../components/pin-code/pin-code-screen-content';
import { useImportPredefinedCredentialSchemas } from '../../hooks/credential-schemas';
import { storePin } from '../../hooks/pin-code/pin-code';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const PinCodeInitializationScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const navigation =
    useNavigation<OnboardingNavigationProp<'PinCodeInitialization'>>();
  const { walletStore } = useStores();

  const initializeONECoreIdentifiers = useInitializeONECoreIdentifiers({
    generateHwKey: true,
    generateSwKey: true,
  });

  const importSchemasFromAssets = useImportPredefinedCredentialSchemas();
  const finishSetup = useCallback(() => {
    if (walletStore.holderIdentifierId) {
      return;
    }
    initializeONECoreIdentifiers().then(([hwDidId, swDidId]) => {
      walletStore.walletSetup(hwDidId, swDidId!);
      importSchemasFromAssets();
    });
    resetNavigationAction(rootNavigation, [
      { name: 'Dashboard', params: { screen: 'Wallet' } },
    ]);
  }, [
    initializeONECoreIdentifiers,
    importSchemasFromAssets,
    rootNavigation,
    walletStore,
  ]);

  const screen = useRef<PinCodeActions>(null);
  const [pin, setPin] = useState<string>();
  const [error, setError] = useState<string>();

  const onPinEntered = useCallback(
    (userEntry: string) => {
      if (pin) {
        if (pin === userEntry) {
          storePin(pin);
          finishSetup();
        } else {
          screen.current?.clearEntry();
          screen.current?.shakeKeypad();
          setError(translate('info.onboarding.pinCodeScreen.confirm.error'));
        }
      } else {
        screen.current?.clearEntry();
        setPin(userEntry);
      }
    },
    [finishSetup, pin],
  );

  const stage = pin ? 'confirm' : 'initial';
  return (
    <PinCodeScreenContent
      error={error}
      instruction={translate(`onboardingPinCodeScreen.${stage}.subtitle`)}
      onBack={navigation.goBack}
      onPinEntered={onPinEntered}
      ref={screen}
      testID="PinCodeInitializationScreen"
      title={translate(`onboardingPinCodeScreen.${stage}.title`)}
    />
  );
};

export default PinCodeInitializationScreen;
