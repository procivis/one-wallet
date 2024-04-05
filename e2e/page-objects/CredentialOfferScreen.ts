export default abstract class CredentialOfferScreen {
  static get screen() {
    return element(by.id('CredentialOfferScreen'));
  }

  static get card() {
    return element(by.id('CredentialOfferScreen.card'));
  }
  static get rejectButton() {
    return element(by.id('CredentialOfferScreen.cancel'));
  }

  static get acceptButton() {
    return element(by.id('CredentialOfferScreen.submit'));
  }

  static scrollTo() {
    const element = this.card;
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialOfferScreen.submit'))
      .scroll(600, 'down', NaN, 0.85);
  }
}
