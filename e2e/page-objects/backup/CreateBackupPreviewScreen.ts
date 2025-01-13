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

  static async credentialAtIndex(index: number) {
    const cardAttributes = await element(
      by.id(/^Credential.credential.[\w-]+.card$/),
    )
      .atIndex(index)
      .getAttributes();
    const id = (
      'elements' in cardAttributes
        ? cardAttributes.elements[0].identifier
        : cardAttributes.identifier
    ).replace('.card', '');
    return CredentialCard(id);
  }
}
