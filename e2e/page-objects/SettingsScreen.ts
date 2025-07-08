import { expect } from 'detox';

export enum SettingsButton {
  BACK = 'SettingsScreen.header.back',
  CHANGE_PIN = 'SettingsScreen.changePIN',
  CHANGE_REMOTE_PIN = 'SettingsScreen.changeRSEPIN',
  CLEAR_CACHE = 'SettingsScreen.clearCache',
  CREATE_BACKUP = 'SettingsScreen.createBackup',
  DELETE_WALLET = 'SettingsScreen.deleteWallet',
  HISTORY = 'SettingsScreen.history',
  INFO = 'SettingsScreen.help',
  LANGUAGE_CHANGE = 'SettingsScreen.languageChange',
  LICENCES = 'SettingsScreen.licences',
  RESTORE_BACKUP = 'SettingsScreen.restoreBackup',
  SCREEN_CAPTURE_PROTECTION = 'SettingsScreen.screenCaptureProtection',
}
export enum LanguageMenu {
  CANCEL = 'Cancel',
  DEUTSCH = 'Deutsch',
  ENGLISH = 'English',
}

export default abstract class SettingsScreen {
  static get screen() {
    return element(by.id('SettingsScreen'));
  }

  static get screenCaptureProtection() {
    return element(by.id('SettingsScreen.screenCaptureProtection'));
  }

  static scrollTo(testID: SettingsButton) {
    return waitFor(this.button(testID))
      .toBeVisible()
      .whileElement(by.id('SettingsScreen.content'))
      .scroll(100, 'down');
  }

  static get back() {
    return element(by.id('SettingsScreen.header.back'));
  }

  private static buttonId(testID: SettingsButton) {
    return by.id(testID);
  }

  static button(testID: SettingsButton) {
    return element(this.buttonId(testID));
  }

  static async selectLanguage(language: LanguageMenu) {
    await element(by.text(language)).tap();
  }

  static async toggleScreenCaptureProtection(enabled: boolean) {
    await this.scrollTo(SettingsButton.SCREEN_CAPTURE_PROTECTION);
    await this.screenCaptureProtection.tap();
    await expect(this.screenCaptureProtection).toHaveToggleValue(enabled);
  }
}
