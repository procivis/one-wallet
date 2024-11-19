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
