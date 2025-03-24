import { expect } from 'detox';

import OnboardingSetupScreen from '../page-objects/onboarding/OnboardingSetupScreen';
import PinCodeScreen from '../page-objects/onboarding/PinCodeScreen';
import SecurityScreen from '../page-objects/onboarding/SecurityScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { reloadApp, userAgreement } from '../utils/init';

describe('Onboarding', () => {
  beforeAll(async () => {
    await device.launchApp({
      languageAndLocale: {
        language: 'en-US',
        locale: 'en-US',
      },
    });
  });

  it('shows PIN init screen', async () => {
    await expect(OnboardingSetupScreen.screen).toBeVisible(1);
    await OnboardingSetupScreen.setupButton.tap();
    await userAgreement();
    await expect(SecurityScreen.screen).toBeVisible(1);
    await SecurityScreen.continueButton.tap();
    await expect(PinCodeScreen.Initialization.screen).toBeVisible(1);
  });

  it('shows Dashboard screen after PIN entry & confirmation', async () => {
    await PinCodeScreen.Initialization.digit(1).multiTap(6);
    await PinCodeScreen.Initialization.digit(1).multiTap(6);
    await expect(WalletScreen.screen).toBeVisible(1);
  });

  it('shows PIN Lock screen after app reopen', async () => {
    await reloadApp();
  });

  it('wrong PIN entry keeps the Lock screen open', async () => {
    await device.launchApp({
      languageAndLocale: {
        language: 'en-US',
        locale: 'en-US',
      },
      newInstance: true,
    });
    await waitFor(PinCodeScreen.Check.screen).toBeVisible(1).withTimeout(5000);
    await expect(PinCodeScreen.Check.error).toHaveText('');
    await PinCodeScreen.Check.digit(2).multiTap(6);
    await expect(PinCodeScreen.Check.error).not.toHaveText('');
  });
});
