import { device, expect } from 'detox';

import PinCodeScreen from '../page-objects/PinCodeScreen';
import { CORRECT_PIN_DIGIT } from './init';

/**
 * Workaround for QR code scanning screen
 *
 * Instead of scanning with phone camera (not available on simulator)
 * feed the app with a deep-link URL from outside, triggering a QR-code scanning flow
 * @param url QR-code content
 */
export async function scanURL(url: string) {
  // openUrl only works on iOS, on android the app must be restarted
  if (device.getPlatform() === 'android') {
    // workaround detox bug: https://github.com/wix/Detox/issues/2549
    await device.launchApp({
      newInstance: true,
      url: url.replace(/&/g, '\\&'),
    });
    await expect(PinCodeScreen.Check.screen).toBeVisible();
    await PinCodeScreen.Check.digit(CORRECT_PIN_DIGIT).multiTap(6);
  } else {
    await device.openURL({ url });
  }
}