export default class RemoteSecureElementInfoScreen {
  static get screen() {
    return element(by.id('RemoteSecureElementInfoScreen'));
  }

  static get back() {
    return element(by.id('RemoteSecureElementInfoScreen.header.back'));
  }

  static get continueButton() {
    return element(by.id('RemoteSecureElementInfoScreen.continue'));
  }
}
