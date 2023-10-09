export default abstract class ProofRequestAcceptProcessScreen {
  static get screen() {
    return element(by.id('ProofRequestAcceptProcessScreen'));
  }

  static get closeButton() {
    return element(by.id('ProofRequestAcceptProcessScreen.close'));
  }
}
