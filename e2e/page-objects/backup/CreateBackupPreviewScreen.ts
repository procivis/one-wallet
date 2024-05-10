import CredentialCard from '../components/CredentialCard';

export default abstract class CreateBackupPreviewScreen {
  static get screen() {
    return element(by.id('CreateBackupPreviewScreen'));
  }

  static get back() {
    return element(by.id('CreateBackupPreviewScreen.back'));
  }

  static get createBackupButton() {
    return element(by.id('CreateBackupPreviewScreen.mainButton'));
  }

  static credentialCard(credentialId: string) {
    return CredentialCard(`Credential.credential.${credentialId}`);
  }
}
