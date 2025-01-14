import CredentialCard from '../components/CredentialCard';
import ProofCredentialCard from '../components/ProofCredentialCard';
import EntityDetailHeader from '../components/TrustEntityHeader';

export default class ProofRequestSharingScreen {
  static get screen() {
    return element(by.id('ProofRequestSharingScreen'));
  }

  static get trustEntity() {
    return EntityDetailHeader('EntityDetail');
  }

  static get infoButton() {
    return element(by.id('Screen.infoButton'));
  }

  static get cancelButton() {
    return element(by.id('Screen.closeButton'));
  }

  static get shareButton() {
    return element(by.id('ProofRequestSharingScreen.shareButton'));
  }
  static get credentialLoadingIndicator() {
    return element(by.id('ProofRequestSharingScreen.indicator.credentials'));
  }

  static async scrollTo(
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down' = 'down',
  ) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('ProofRequestSharingScreen.scroll'))
      .scroll(400, direction);
  }

  static async credentialAtIndex(index: number) {
    const cardAttributes = await element(
      by.id(/^ProofRequestSharingScreen.credential.[\w-]+.card$/),
    )
      .atIndex(index)
      .getAttributes();
    const id = (
      'elements' in cardAttributes
        ? cardAttributes.elements[0].identifier
        : cardAttributes.identifier
    ).replace('.card', '');
    return CredentialCard(id);
  }

  static credential(credentialIndex: number) {
    return ProofCredentialCard(
      `ProofRequestSharingScreen.credential.input_${credentialIndex}`,
    );
  }
}
