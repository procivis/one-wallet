export default abstract class CredentialDeletePromptScreen {
  static get deleteButton() {
    return element(by.id('CredentialDeletePromptScreen.mainButton'));
  }

  static get cancelButton() {
    return element(by.id('CredentialDeletePromptScreen.close'));
  }
}
