export default class RemoteSecureElementPinSetupScreen {
  static get screen() {
    return element(by.id('RemoteSecureElementPinSetupScreen'));
  }

  static get close() {
    return element(by.id('RemoteSecureElementPinSetupScreen.header.back'));
  }

  static digit(n: number) {
    return element(by.text(n.toString()));
  }
}
