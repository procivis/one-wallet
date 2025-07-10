import { TrustEntityHeader } from '../trust-entity';
import ProofRequestSharingNerdScreen from './ProofRequestSharingNerdScreen';

export default class ProofRequestNerdScreen extends ProofRequestSharingNerdScreen {
  static async scrollToCredentialView(credentialId: string) {
    await this.scrollTo(
      element(by.id(`ProofRequestNerdView.issuerTrustEntity.${credentialId}`)),
    );
  }

  static trustEntityByCredentialID(credentialId: string) {
    return new TrustEntityHeader(
      `ProofRequestNerdView.issuerTrustEntity.${credentialId}`,
    );
  }

  static get entityDetailHeader() {
    return new TrustEntityHeader('ProofRequestNerdView.verifierTrustEntity');
  }
}
