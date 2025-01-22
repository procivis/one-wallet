import CredentialCard from './components/CredentialCard';
import EntityDetailHeader from './components/TrustEntityHeader';

export default class CredentialOfferScreen {
  static get screen() {
    return element(by.id('CredentialOfferScreen'));
  }

  static get infoButton() {
    return element(by.id('CredentialOfferScreen.header.info'));
  }

  static get trustEntityDetailName() {
    return element(by.id('EntityDetail.entityName'));
  }

  static get credentialCard() {
    return CredentialCard('CredentialOfferScreen.detail');
  }

  static get rejectButton() {
    return element(by.id('CredentialOfferScreen.header.close'));
  }

  static get disclaimer() {
    return element(by.id('CredentialOfferScreen.disclaimer'));
  }

  static get acceptButton() {
    return element(by.id('CredentialOfferScreen.accept'));
  }

  static get trustEntity() {
    return EntityDetailHeader('EntityDetail');
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
