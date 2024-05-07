import { expect } from 'detox';

import CreateBackupDashboardScreen from '../page-objects/backup/CreateBackupDashboardScreen';
import PinCodeChangeScreen from '../page-objects/ChangePinCodeScreen';
import HistoryScreen from '../page-objects/HistoryScreen';
import RestoreBackupDashboardScreen from '../page-objects/restore/RestoreBackupDashboardScreen';
import AppInformationScreen from '../page-objects/settings/AppInformationScreen';
import DeleteWalletScreen from '../page-objects/settings/DeleteWalletScreen';
import LicencesScreen from '../page-objects/settings/LicenceScreen';
import SettingsScreen, {
  LanguageMenu,
  SettingsButton,
} from '../page-objects/SettingsScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { launchApp } from '../utils/init';

describe('ONE-1798: Accessing Settings and all screens in the settings area', () => {
  beforeAll(async () => {
    await launchApp();
    await expect(WalletScreen.screen).toBeVisible();
    await WalletScreen.settingsButton.tap();
  });

  beforeEach(async () => {
    await expect(SettingsScreen.screen).toBeVisible();
  });

  it('Language option', async () => {
    // await expect(element(by.text('Settings'))).toBeVisible();
    await SettingsScreen.button(SettingsButton.LANGUAGE_CHANGE).tap();
    await SettingsScreen.selectLanguage(LanguageMenu.DEUTSCH);
    // await expect(element(by.text('Einstellungen'))).toBeVisible();
    await SettingsScreen.button(SettingsButton.LANGUAGE_CHANGE).tap();
    await SettingsScreen.selectLanguage(LanguageMenu.ENGLISH);
    // await expect(element(by.text('Settings'))).toBeVisible();
  });

  it('History option', async () => {
    await SettingsScreen.button(SettingsButton.HISTORY).tap();
    await expect(HistoryScreen.screen).toBeVisible();
    await HistoryScreen.back.tap();
  });

  it('Create backup option', async () => {
    await SettingsScreen.button(SettingsButton.CREATE_BACKUP).tap();
    await expect(CreateBackupDashboardScreen.screen).toBeVisible();
    await CreateBackupDashboardScreen.back.tap();
  });

  it('Restore backup option', async () => {
    await SettingsScreen.button(SettingsButton.RESTORE_BACKUP).tap();
    await expect(RestoreBackupDashboardScreen.screen).toBeVisible();
    await RestoreBackupDashboardScreen.back.tap();
  });

  it('Change PIN code option', async () => {
    await SettingsScreen.button(SettingsButton.CHANGE_PIN).tap();
    await expect(PinCodeChangeScreen.screen).toBeVisible();
    await PinCodeChangeScreen.back.tap();
  });

  it('Information option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.INFO);
    await SettingsScreen.button(SettingsButton.INFO).tap();
    await expect(AppInformationScreen.screen).toBeVisible();
    await AppInformationScreen.back.tap();
  });

  it('Licences option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.LICENCES);
    await SettingsScreen.button(SettingsButton.LICENCES).tap();
    await expect(LicencesScreen.screen).toBeVisible();
    await LicencesScreen.back.tap();
  });

  it('Delete wallet option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.DELETE_WALLET);
    await SettingsScreen.button(SettingsButton.DELETE_WALLET).tap();
    await expect(DeleteWalletScreen.screen).toBeVisible();
    await DeleteWalletScreen.back.tap();
  });
});
