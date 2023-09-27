export default abstract class CredentialOfferScreen {
  static get screen() {
    return element(by.id('CredentialOfferScreen'));
  }

  static get rejectButton() {
    return element(by.id('CredentialOfferScreen.cancel'));
  }

  static get acceptButton() {
    return element(by.id('CredentialOfferScreen.submit'));
  }
}
