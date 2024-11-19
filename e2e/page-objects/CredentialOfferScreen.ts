import CredentialCard from './components/CredentialCard';

export default class CredentialOfferScreen {
  static get screen() {
    return element(by.id('CredentialOfferScreen'));
  }

  static get credentialCard() {
    return CredentialCard('CredentialOfferScreen.detail');
  }

  static get rejectButton() {
    return element(by.id('Screen.closeButton'));
  }

  static get acceptButton() {
    return element(by.id('CredentialOfferScreen.accept'));
  }

  static async scrollTo(
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down' = 'down',
  ) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialOfferScreen.scroll'))
      .scroll(600, direction, NaN, 0.3);
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
