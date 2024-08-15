export default abstract class CredentialOfferScreen {
  static get screen() {
    return element(by.id('CredentialOfferScreen'));
  }

  static get card() {
    return element(by.id('CredentialOfferScreen.detail.card'));
  }
  static get rejectButton() {
    return element(by.id('Screen.closeButton'));
  }

  static get acceptButton() {
    return element(by.id('CredentialOfferScreen.accept'));
  }

  static scrollTo() {
    const element = this.card;
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialOfferScreen.accept'))
      .scroll(600, 'down', NaN, 0.85);
  }

  static get rejectAlert() {
    return {
      get cancelButton() {
        return element(by.text('CANCEL'));
      },
      get message() {
        return element(
          by.text(
            'By closing you are rejecting this offering. This cannot be undone.',
          ),
        );
      },
      get rejectButton() {
        return element(by.text('REJECT'));
      },
      get title() {
        return element(by.text('Reject offering'));
      },
    };
  }
}
