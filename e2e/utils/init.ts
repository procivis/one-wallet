import { expect } from 'detox';

import OnboardingSetupScreen from '../page-objects/onboarding/OnboardingSetupScreen';
import PinCodeScreen from '../page-objects/onboarding/PinCodeScreen';
import SecurityScreen from '../page-objects/onboarding/SecurityScreen';
import UserAgreementScreen from '../page-objects/onboarding/UserAgreementScreen';
import StatusCheckResultScreen from '../page-objects/StatusCheckResultScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { verifyButtonEnabled } from './button';

/**
 * correct app PIN is '111111' used among all test suites
 */
export const CORRECT_PIN_DIGIT = 1;

export async function pinSetup() {
  await expect(PinCodeScreen.Initialization.screen).toBeVisible();
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await expect(WalletScreen.screen).toBeVisible();
}

type ReloadAllType = {
  credentialIds?: string[];
  revokedScreen?: boolean;
  suspendedScreen?: boolean;
};

export async function reloadApp(values?: ReloadAllType) {
  await device.launchApp({ newInstance: true });
  await expect(PinCodeScreen.Check.screen).toBeVisible();
  await PinCodeScreen.Check.digit(CORRECT_PIN_DIGIT).multiTap(6);

  if (values?.suspendedScreen || values?.revokedScreen) {
    await expect(StatusCheckResultScreen.screen).toBeVisible();
    const status = values.revokedScreen ? 'revoked' : 'suspended';
    for (const credentialId of values.credentialIds || []) {
      await expect(
        StatusCheckResultScreen.credentialCard(credentialId).element,
      ).toBeVisible();
      await StatusCheckResultScreen.credentialCard(credentialId).verifyStatus(
        status,
      );
    }

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

export async function launchApp(config?: LaunchAppConfig) {
  await device.launchApp({
    delete: config?.delete,
    permissions: { camera: 'YES' },
  });
  await expect(OnboardingSetupScreen.screen).toBeVisible();
  await OnboardingSetupScreen.setupButton.tap();

  await userAgreement();

  await expect(SecurityScreen.screen).toBeVisible();
  await SecurityScreen.continueButton.tap();

  await pinSetup();
}
