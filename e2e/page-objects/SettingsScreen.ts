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
}
