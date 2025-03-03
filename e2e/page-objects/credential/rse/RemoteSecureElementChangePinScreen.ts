import RemoteSecureElementPinLayout from './RemoteSecureElementPinLayout';

export default class RemoteSecureElementChangePinScreen extends RemoteSecureElementPinLayout {
  static get screen() {
    return element(by.id('RemoteSecureElementChangePinScreen'));
  }

  static get title() {
    return element(by.id('RemoteSecureElementChangePinScreen.title'));
  }

  static get close() {
    return element(by.id('RemoteSecureElementChangePinScreen.header.back'));
  }
}
