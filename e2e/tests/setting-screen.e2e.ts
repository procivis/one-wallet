import { expect } from 'detox';

import CreateBackupDashboardScreen from '../page-objects/backup/CreateBackupDashboardScreen';
import PinCodeChangeScreen from '../page-objects/ChangePinCodeScreen';
import HistoryScreen from '../page-objects/HistoryScreen';
import RestoreBackupDashboardScreen from '../page-objects/restore/RestoreBackupDashboardScreen';
import AppInformationScreen from '../page-objects/settings/AppInformationScreen';
import ClearCacheScreen from '../page-objects/settings/ClearCacheScreen';
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
    await expect(WalletScreen.screen).toBeVisible(1);
    await WalletScreen.settingsButton.tap();
  });

  beforeEach(async () => {
    await expect(SettingsScreen.screen).toBeVisible(1);
  });

  it('Language option', async () => {
    await expect(
      SettingsScreen.button(SettingsButton.LANGUAGE_CHANGE),
    ).toHaveLabel('Change language');
    await SettingsScreen.button(SettingsButton.LANGUAGE_CHANGE).tap();
    await SettingsScreen.selectLanguage(LanguageMenu.DEUTSCH);
    await expect(
      SettingsScreen.button(SettingsButton.LANGUAGE_CHANGE),
    ).toHaveLabel('Sprache ändern');
    await SettingsScreen.button(SettingsButton.LANGUAGE_CHANGE).tap();
    await SettingsScreen.selectLanguage(LanguageMenu.ENGLISH);
  });

  it('History option', async () => {
    await SettingsScreen.button(SettingsButton.HISTORY).tap();
    await expect(HistoryScreen.screen).toBeVisible(1);
    await HistoryScreen.back.tap();
  });

  it('Create backup option', async () => {
    await SettingsScreen.button(SettingsButton.CREATE_BACKUP).tap();
    await expect(CreateBackupDashboardScreen.screen).toBeVisible(1);
    await CreateBackupDashboardScreen.back.tap();
  });

  it('Restore backup option', async () => {
    await SettingsScreen.button(SettingsButton.RESTORE_BACKUP).tap();
    await expect(RestoreBackupDashboardScreen.screen).toBeVisible(1);
    await RestoreBackupDashboardScreen.back.tap();
  });

  it('Change PIN code option', async () => {
    await SettingsScreen.button(SettingsButton.CHANGE_PIN).tap();
    await expect(PinCodeChangeScreen.screen).toBeVisible(1);
    await PinCodeChangeScreen.back.tap();
  });

  it('Information option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.INFO);
    await SettingsScreen.button(SettingsButton.INFO).tap();
    await expect(AppInformationScreen.screen).toBeVisible(1);
    await AppInformationScreen.back.tap();
  });

  it('Licences option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.LICENCES);
    await SettingsScreen.button(SettingsButton.LICENCES).tap();
    await expect(LicencesScreen.screen).toBeVisible(1);
    await LicencesScreen.back.tap();
  });

  it('Clear cache option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.CLEAR_CACHE);
    await SettingsScreen.button(SettingsButton.CLEAR_CACHE).tap();
    await expect(ClearCacheScreen.screen).toBeVisible(1);
    await ClearCacheScreen.back.tap();
  });

  it('Delete wallet option', async () => {
    await SettingsScreen.scrollTo(SettingsButton.DELETE_WALLET);
    await SettingsScreen.button(SettingsButton.DELETE_WALLET).tap();
    await expect(DeleteWalletScreen.screen).toBeVisible(1);
    await DeleteWalletScreen.back.tap();
  });

  it('Settings view - without RSE onboarding', async () => {
    await SettingsScreen.scrollTo(SettingsButton.CHANGE_PIN);
    await expect(
      SettingsScreen.button(SettingsButton.CHANGE_REMOTE_PIN),
    ).not.toBeVisible();
  });
});
