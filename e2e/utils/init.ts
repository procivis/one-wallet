import { expect } from 'detox';

import OnboardingSetupScreen from '../page-objects/OnboardingSetupScreen';
import PinCodeScreen from '../page-objects/PinCodeScreen';
import PinCodeSetScreen from '../page-objects/PinCodeSetScreen';
import WalletScreen from '../page-objects/WalletScreen';

/**
 * correct app PIN is '111111' used among all test suites
 */
export const CORRECT_PIN_DIGIT = 1;

export async function pinSetup() {
  await OnboardingSetupScreen.setupButton.tap();
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await PinCodeSetScreen.closeButton.tap();
}

export async function reloadApp() {
  await device.launchApp({ newInstance: true });
  await expect(PinCodeScreen.Check.screen).toBeVisible();
  await PinCodeScreen.Check.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await expect(WalletScreen.screen).toBeVisible();
}

type LaunchAppConfig = {
  delete?: boolean;
};

export async function launchApp(config?: LaunchAppConfig) {
  await device.launchApp({
    delete: config?.delete,
    permissions: { camera: 'YES' },
  });
  await pinSetup();
}
