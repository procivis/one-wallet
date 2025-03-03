import RemoteSecureElementPinLayout from './RemoteSecureElementPinLayout';

export default class RemoteSecureElementPinSetupScreen extends RemoteSecureElementPinLayout {
  static get screen() {
    return element(by.id('RemoteSecureElementPinSetupScreen'));
  }

  static get close() {
    return element(by.id('RemoteSecureElementPinSetupScreen.header.back'));
  }
}
