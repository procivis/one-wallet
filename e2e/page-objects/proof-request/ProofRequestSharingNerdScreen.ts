import { TrustEntityHeader } from '../trust-entity';
import TrustEntityDetail from '../trust-entity/TrustEntityDetail';

export default class ProofRequestSharingNerdScreen {
  static get screen() {
    return element(by.id('ProofRequestNerdView'));
  }

  static async close() {
    await element(by.id('ProofRequestNerdView.closeIcon')).tap();
  }

  static get entityCluster() {
    const id = 'ProofRequestNerdView.verifierTrustEntity';
    return {
      get detail() {
        return TrustEntityDetail(id);
      },
      get header() {
        return TrustEntityHeader(id);
      },
    }
  }

  protected static async scrollTo(element: Detox.IndexableNativeElement) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('ProofRequestNerdView'))
      .scroll(200, 'down');
  }
}
