import CredentialCard from '../components/CredentialCard';
import ProofCredentialCard from '../components/ProofCredentialCard';
import { TrustEntityHeader } from '../trust-entity';

export default class ProofRequestSharingScreen {
  static get screen() {
    return element(by.id('ProofRequestSharingScreen'));
  }

  static get trustEntity() {
    return new TrustEntityHeader('ProofRequestSharingScreen.entityCluster');
  }

  static get infoButton() {
    return element(by.id('ProofRequestSharingScreen.header.info'));
  }

  static get cancelButton() {
    return element(by.id('ProofRequestSharingScreen.header.close'));
  }

  static get shareButton() {
    return element(by.id('ProofRequestSharingScreen.shareButton'));
  }

  static get disclaimer() {
    return element(by.id('ProofRequestSharingScreen.disclaimer'));
  }

  static get credentialLoadingIndicator() {
    return element(by.id('ProofRequestSharingScreen.indicator.credentials'));
  }

  static get credentialCards() {
    return element(
      by.id('/^ProofRequestSharingScreen.credential.[w-]+.card$/'),
    );
  }

  static async scrollTo(
    this: void,
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down' = 'down',
  ) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('ProofRequestSharingScreen.scroll'))
      .scroll(400, direction);
  }

  static credentialAtIndex(index: number) {
    const id = `ProofRequestSharingScreen.credential.input_${index}`;
    return CredentialCard(id);
  }

  static credential(credentialIndex: number) {
    return ProofCredentialCard(
      `ProofRequestSharingScreen.credential.input_${credentialIndex}`,
    );
  }
}
