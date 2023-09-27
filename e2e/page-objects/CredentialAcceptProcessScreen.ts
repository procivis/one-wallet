export default abstract class CredentialAcceptProcessScreen {
  static get screen() {
    return element(by.id('CredentialAcceptProcessScreen'));
  }

  static get closeButton() {
    return element(by.id('CredentialAcceptProcessScreen.close'));
  }
}
