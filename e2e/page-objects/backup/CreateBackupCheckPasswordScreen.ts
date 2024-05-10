export default abstract class CreateBackupCheckPasswordScreen {
  static get screen() {
    return element(by.id('CreateBackupCheckPasswordScreen'));
  }
  static password(password: string) {
    return element(
      by.id('CreateBackupCheckPasswordScreen.input.password'),
    ).typeText(password);
  }

  static get submitButton() {
    return element(by.id('CreateBackupCheckPasswordScreen.mainButton'));
  }
}
