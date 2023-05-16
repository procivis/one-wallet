import { expect } from 'detox';

describe('Onboarding', () => {
  beforeAll(async () => {
    await device.launchApp({});
  });

  it('shows PIN init screen', async () => {
    await expect(element(by.id('PinCodeInitializationScreen'))).toBeVisible();
  });

  it('shows PIN Set screen after entry & confirmation', async () => {
    await element(by.id('PinCodeInitializationScreen.keypad.1')).multiTap(6);
    await element(by.id('PinCodeInitializationScreen.keypad.1')).multiTap(6);
    await expect(element(by.id('PinCodeSetScreen'))).toBeVisible();
    await element(by.id('PinCodeSetScreen.close')).tap();
    await expect(element(by.id('WalletScreen'))).toBeVisible();
  });

  it('shows PIN Lock screen after app reopen', async () => {
    await device.reloadReactNative();
    await expect(element(by.id('PinCodeCheckScreen'))).toBeVisible();
    await element(by.id('PinCodeCheckScreen.keypad.1')).multiTap(6);
    await expect(element(by.id('WalletScreen'))).toBeVisible();
  });
});
