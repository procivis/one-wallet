import TrustEntityDetail from '../components/TrustEntityDetail';

export default abstract class ProofRequestSharingNerdScreen {
  static get screen() {
    return element(by.id('ProofRequestNerdView'));
  }

  static async close() {
    await element(by.id('ProofRequestNerdView.closeIcon')).tap();
  }

  static get TrustEntityInfo() {
    return TrustEntityDetail('ProofRequestNerdView.verifierTrustEntity');
  }

  protected static async scrollTo(element: Detox.IndexableNativeElement) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('ProofRequestNerdView'))
      .scroll(200, 'down');
  }
}
