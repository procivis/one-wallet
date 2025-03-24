import { expect } from 'detox';

import QRCodeScannerMockScreen from '../page-objects/QrCodeScannerScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { launchApp } from '../utils/init';

describe('ONE-3119: implement camera mocking', () => {
  beforeAll(async () => {
    await launchApp();
  });

  it('Click camera button open mocked screen', async () => {
    await expect(WalletScreen.screen).toBeVisible(1);
    await WalletScreen.scanQRCodeButton.tap();
    await expect(QRCodeScannerMockScreen.screen).toBeVisible(1);
    await expect(QRCodeScannerMockScreen.scanUriButton).toBeVisible();
    await expect(QRCodeScannerMockScreen.textInput).toBeVisible(50);
    await expect(QRCodeScannerMockScreen.back).toBeVisible();
  });
});
