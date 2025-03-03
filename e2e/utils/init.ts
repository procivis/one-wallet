import { expect } from 'detox';

import OnboardingSetupScreen from '../page-objects/onboarding/OnboardingSetupScreen';
import PinCodeScreen from '../page-objects/onboarding/PinCodeScreen';
import SecurityScreen from '../page-objects/onboarding/SecurityScreen';
import UserAgreementScreen from '../page-objects/onboarding/UserAgreementScreen';
import StatusCheckResultScreen from '../page-objects/StatusCheckResultScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { verifyButtonEnabled } from './button';
import { CredentialUpdateProps, statusScreenCheck } from './status-check';

/**
 * correct app PIN is '111111' used among all test suites
 */
export const CORRECT_PIN_DIGIT = 1;

export const DEFAULT_WAIT_TIME = 5000;
export const LONG_WAIT_TIME = 15000;
export const SHORT_WAIT_TIME = 3000;

export async function pinSetup() {
  await expect(PinCodeScreen.Initialization.screen).toBeVisible();
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await expect(WalletScreen.screen).toBeVisible();
}

type ReloadAppProps = {
  credentialUpdate?: CredentialUpdateProps[];
};

export async function reloadApp(values?: ReloadAppProps) {
  await device.launchApp({
    languageAndLocale: {
      language: 'en-US',
      locale: 'en-US',
    },
    newInstance: true,
  });
  await expect(PinCodeScreen.Check.screen).toBeVisible();
  await PinCodeScreen.Check.digit(CORRECT_PIN_DIGIT).multiTap(6);

  if (values?.credentialUpdate) {
    await waitFor(StatusCheckResultScreen.screen)
      .toBeVisible()
      .withTimeout(10000);
    await statusScreenCheck(values.credentialUpdate);
    await StatusCheckResultScreen.closeButton.tap();
  }
  await expect(WalletScreen.screen).toBeVisible();
}

export async function userAgreement() {
  await expect(UserAgreementScreen.screen).toBeVisible();
  await verifyButtonEnabled(UserAgreementScreen.acceptButton, false);
  await UserAgreementScreen.termsAgreementCheckbox.verifyChecked(false);
  await UserAgreementScreen.termsAgreementCheckbox.checkbox.tap();
  await UserAgreementScreen.termsAgreementCheckbox.verifyChecked(true);
  await verifyButtonEnabled(UserAgreementScreen.acceptButton, true);
  await UserAgreementScreen.acceptButton.tap();
}

type LaunchAppConfig = {
  delete?: boolean;
};

export interface RSEConfig {
  PINCode: string;
  isRSEOnboarded: boolean;
  signCertCount?: number;
}

export async function launchApp(config?: LaunchAppConfig) {
  await device.launchApp({
    delete: config?.delete,
    languageAndLocale: {
      language: 'en-US',
      locale: 'en-US',
    },
    permissions: { camera: 'YES' },
  });
  await moveToDashboardScreenFromOnboardingScreen();
}

export async function moveToDashboardScreenFromOnboardingScreen() {
  await expect(OnboardingSetupScreen.screen).toBeVisible();
  await OnboardingSetupScreen.setupButton.tap();

  await userAgreement();

  await expect(SecurityScreen.screen).toBeVisible();
  await SecurityScreen.continueButton.tap();

  await pinSetup();
}
