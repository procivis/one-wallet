export default abstract class CreateBackupDashboardScreen {
  static get screen() {
    return element(by.id('CreateBackupDashboardScreen'));
  }

  static get history() {
    return element(by.id('CreateBackupDashboardScreen.history'));
  }

  static get newBackupButton() {
    return element(by.id('CreateBackupDashboardScreen.mainButton'));
  }
}
