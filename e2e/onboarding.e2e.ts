import { expect } from 'detox';

import PinCodeScreen from './page-objects/PinCodeScreen';
import PinCodeSetScreen from './page-objects/PinCodeSetScreen';
import WalletScreen from './page-objects/WalletScreen';

describe('Onboarding', () => {
  beforeAll(async () => {
    await device.launchApp({});
  });

  it('shows PIN init screen', async () => {
    await expect(PinCodeScreen.Initialization.screen).toBeVisible();
  });

  it('shows PIN Set screen after entry & confirmation', async () => {
    await PinCodeScreen.Initialization.digit(1).multiTap(6);
    await PinCodeScreen.Initialization.digit(1).multiTap(6);
    await expect(PinCodeSetScreen.screen).toBeVisible();
    await PinCodeSetScreen.closeButton.tap();
    await expect(WalletScreen.screen).toBeVisible();
  });

  it('shows PIN Lock screen after app reopen', async () => {
    await device.reloadReactNative();
    await expect(PinCodeScreen.Check.screen).toBeVisible();
    await PinCodeScreen.Check.digit(1).multiTap(6);
    await expect(WalletScreen.screen).toBeVisible();
  });
});