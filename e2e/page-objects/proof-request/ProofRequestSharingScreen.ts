import ProofCredentialCard from '../components/ProofCredentialCard';

export default abstract class ProofRequestSharingScreen {
  static get screen() {
    return element(by.id('ProofRequestSharingScreen'));
  }

  static get cancelButton() {
    return element(by.id('Screen.closeButton'));
  }

  static get shareButton() {
    return element(by.id('ProofRequestSharingScreen.shareButton'));
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

  static credential(credentialIndex: number) {
    return ProofCredentialCard(
      `ProofRequestSharingScreen.credential.input_${credentialIndex}`,
    );
  }
}
