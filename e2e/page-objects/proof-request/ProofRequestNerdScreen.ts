import EntityDetailHeader from '../components/TrustEntityHeader';
import ProofRequestSharingNerdScreen from './ProofRequestSharingNerdScreen';

export default abstract class ProofRequestNerdScreen extends ProofRequestSharingNerdScreen {
  static async scrollToCredentialView(credentialId: string) {
    await this.scrollTo(
      element(by.id(`ProofRequestNerdView.issuerTrustEntity.${credentialId}`)),
    );
  }

  static trustEntityByCredentialID(credentialId: string) {
    return EntityDetailHeader(
      `ProofRequestNerdView.issuerTrustEntity.${credentialId}`,
    );
  }

  static get entityDetailHeader() {
    return EntityDetailHeader('ProofRequestNerdView.verifierTrustEntity');
  }
}
