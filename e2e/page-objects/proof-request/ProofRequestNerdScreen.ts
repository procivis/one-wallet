import TrustEntityDetail from '../components/TrustEntityDetail';

export default abstract class ProofRequestNerdScreen {
  static get screen() {
    return element(by.id('ProofRequest.nerdView'));
  }

  static async close() {
    await element(by.id('ProofRequest.nerdView.closeIcon')).tap();
  }

  static get TrustEntityInfo() {
    return TrustEntityDetail('ProofRequest.nerdView.entityCluster');
  }

  private static async scrollTo(element: Detox.IndexableNativeElement) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('ProofRequest.nerdView'))
      .scroll(100, 'down');
  }
}
