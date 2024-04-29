import CredentialCard from './components/CredentialCard';

export default abstract class StatusCheckResultScreen {
  static get screen() {
    return element(by.id('StatusCheckResultScreen'));
  }

  static get closeButton() {
    return element(by.id('StatusCheckResultScreen.close'));
  }

  static credentialCard(credentialId: string) {
    return CredentialCard(`Credential.credential.${credentialId}`);
  }
}
