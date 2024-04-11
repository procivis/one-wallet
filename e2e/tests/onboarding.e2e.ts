import { expect } from 'detox';

import OnboardingSetupScreen from '../page-objects/onboarding/OnboardingSetupScreen';
import PinCodeScreen from '../page-objects/onboarding/PinCodeScreen';
import SecurityScreen from '../page-objects/onboarding/SecurityScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { reloadApp, userAgreement } from '../utils/init';

describe('Onboarding', () => {
  beforeAll(async () => {
    await device.launchApp({});
  });

  it('shows PIN init screen', async () => {
    await expect(OnboardingSetupScreen.screen).toBeVisible();
    await OnboardingSetupScreen.setupButton.tap();
    await userAgreement();
    await expect(SecurityScreen.screen).toBeVisible();
    await SecurityScreen.continueButton.tap();
    await expect(PinCodeScreen.Initialization.screen).toBeVisible();
  });

  it('shows Dashboard screen after PIN entry & confirmation', async () => {
    await PinCodeScreen.Initialization.digit(1).multiTap(6);
    await PinCodeScreen.Initialization.digit(1).multiTap(6);
    await expect(WalletScreen.screen).toBeVisible();
  });

  it('shows PIN Lock screen after app reopen', async () => {
    await reloadApp();
  });

  it('wrong PIN entry keeps the Lock screen open', async () => {
    await device.launchApp({ newInstance: true });
    await expect(PinCodeScreen.Check.screen).toBeVisible();
    await expect(PinCodeScreen.Check.error).toHaveText('');
    await PinCodeScreen.Check.digit(2).multiTap(6);
    await expect(PinCodeScreen.Check.error).not.toHaveText('');
  });
});
