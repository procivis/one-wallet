export default abstract class BackupRecoveryPasswordScreen {
  static get screen() {
    return element(by.id('CreateBackupRecoveryPasswordScreen'));
  }

  static password(password: string) {
    return element(
      by.id('CreateBackupRecoveryPasswordScreen.input.password'),
    ).typeText(password);
  }
  static reEnterPassword(password: string) {
    return element(
      by.id('CreateBackupRecoveryPasswordScreen.input.reenterPassword'),
    ).typeText(password);
  }

  static get setPasswordButton() {
    return element(by.id('CreateBackupRecoveryPasswordScreen.mainButton'));
  }
}
