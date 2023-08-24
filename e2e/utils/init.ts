import PinCodeScreen from '../page-objects/PinCodeScreen';
import PinCodeSetScreen from '../page-objects/PinCodeSetScreen';

/**
 * correct app PIN is '111111' used among all test suites
 */
export const CORRECT_PIN_DIGIT = 1;

export async function pinSetup() {
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await PinCodeScreen.Initialization.digit(CORRECT_PIN_DIGIT).multiTap(6);
  await PinCodeSetScreen.closeButton.tap();
}
