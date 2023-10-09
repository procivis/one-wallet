export default abstract class ProofRequestSharingScreen {
  static get screen() {
    return element(by.id('ProofRequestSharingScreen'));
  }

  static get cancelButton() {
    return element(by.id('ProofRequestSharingScreen.cancel'));
  }

  static get shareButton() {
    return element(by.id('ProofRequestSharingScreen.submit'));
  }
}
