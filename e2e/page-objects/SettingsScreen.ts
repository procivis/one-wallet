export default abstract class SettingsScreen {
  static get screen() {
    return element(by.id('SettingsScreen'));
  }

  static get historyButton() {
    return element(by.id('SettingsScreen.history'));
  }

  static get back() {
    return element(by.id('SettingsScreen.header.back'));
  }

  static get createBackupButton() {
    return element(by.id('SettingsScreen.createBackup'));
  }

  static get restoreBackupButton() {
    return element(by.id('SettingsScreen.restoreBackup'));
  }

  static get languageChangepButton() {
    return element(by.id('SettingsScreen.languageChange'));
  }
}
