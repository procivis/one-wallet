import { expect } from 'detox';

import PinCodeChangeScreen from '../../page-objects/ChangePinCodeScreen';
import QRCodeScannerMockScreen from '../../page-objects/QrCodeScannerScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { launchApp } from '../../utils/init';

const assertScreenshotBlocked = async (screenshotName: string) => {
  if (device.getPlatform() === 'ios') {
    console.log('Screenshot prevention does not work in iOS simulator');
    return;
  }

  let screenshotSucceeded = false;
  try {
    await device.takeScreenshot(screenshotName);
    screenshotSucceeded = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(
      `Screenshot blocked as expected for ${screenshotName} on Android:`,
      errorMessage,
    );
    return;
  }
  if (screenshotSucceeded) {
    throw new Error(
      `Screenshot should have been blocked for ${screenshotName} on Android, but it was allowed`,
    );
  }
};

const assertScreenshotAllowed = async (screenshotName: string) => {
  if (device.getPlatform() === 'ios') {
    console.log('Screenshot prevention does not work in iOS simulator');
    return;
  }

  try {
    await device.takeScreenshot(screenshotName);
    console.log(
      `Screenshot allowed as expected for ${screenshotName} on Android`,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Screenshot should have been allowed for ${screenshotName} on Android but it failed. Original error: ${errorMessage}`,
    );
  }
};

describe('ONE-6120: Introduce Toggle in order to share phone screen', () => {
  describe('Screen capture protection: Enabled', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
      await expect(WalletScreen.screen).toBeVisible(1);
    });

    it('Prevent screenshots during PIN code entry', async () => {
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.scrollTo(SettingsButton.SCREEN_CAPTURE_PROTECTION);
      await expect(SettingsScreen.screenCaptureProtection).toHaveToggleValue(
        true,
      );

      await SettingsScreen.button(SettingsButton.CHANGE_PIN).tap();
      waitFor(PinCodeChangeScreen.screen).toBeVisible(1);
      await assertScreenshotBlocked('pin-entry-screenshot');
    });

    it('Prevent screenshots during QR code scanner screen', async () => {
      await WalletScreen.scanQRCodeButton.tap();
      await expect(QRCodeScannerMockScreen.screen).toBeVisible(1);
      await assertScreenshotBlocked('qr-scanner-screenshot');
    });

    it('Allow screenshots on non-sensitive screens', async () => {
      await assertScreenshotAllowed('wallet-screenshot');
    });
  });

  describe('Screen capture protection: Disabled', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
      await expect(WalletScreen.screen).toBeVisible();
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.toggleScreenCaptureProtection(false);
      await SettingsScreen.back.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Allow screenshots during PIN code entry', async () => {
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.button(SettingsButton.CHANGE_PIN).tap();

      waitFor(PinCodeChangeScreen.screen).toBeVisible();
      await assertScreenshotAllowed('pin-entry-allowed-screenshot');
    });

    it('Allow screenshots during QR code scanner screen', async () => {
      await WalletScreen.scanQRCodeButton.tap();
      await expect(QRCodeScannerMockScreen.screen).toBeVisible();
      await assertScreenshotAllowed('qr-scanner-allowed-screenshot');
    });
  });
});
