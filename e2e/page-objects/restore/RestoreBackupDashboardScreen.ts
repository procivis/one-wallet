export default abstract class RestoreBackupDashboardScreen {
  static get screen() {
    return element(by.id('RestoreBackupDashboardScreen'));
  }
  static get restoreButton() {
    return element(by.id('RestoreBackupDashboardScreen.mainButton'));
  }
}
