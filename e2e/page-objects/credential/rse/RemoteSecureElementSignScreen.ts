import { LONG_WAIT_TIME } from '../../../utils/init';
import { waitForElementVisible } from '../../components/ElementUtil';
import RemoteSecureElementPinLayout from './RemoteSecureElementPinLayout';

export default class RemoteSecureElementSignScreen extends RemoteSecureElementPinLayout {
  static get screen() {
    return element(by.id('RemoteSecureElementSignScreen'));
  }

  static get error() {
    return element(by.id('RemoteSecureElementSignScreen.error'));
  }

  static waitForScreenDisplayedAndFillPINCode = async (PINCode: string) => {
    await waitForElementVisible(
      RemoteSecureElementSignScreen.screen,
      LONG_WAIT_TIME,
      1,
    );
    await this.fillRemotePINCode(PINCode);
  };
}
