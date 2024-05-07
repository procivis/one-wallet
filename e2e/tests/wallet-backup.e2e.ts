import { expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import BackupPreviewScreen from '../page-objects/backup/BackupPreviewScreen';
import CreateBackupProcessingScreen from '../page-objects/backup/BackupProcessingScreen';
import BackupRecoveryPasswordScreen from '../page-objects/backup/BackupRecoveryPasswordScreen';
import CreateBackupDashboardScreen from '../page-objects/backup/CreateBackupDashboardScreen';
import OnboardingSetupScreen from '../page-objects/onboarding/OnboardingSetupScreen';
import RestoreBackupDashboardScreen from '../page-objects/restore/RestoreBackupDashboardScreen';
import RestoreBackupImportScreen from '../page-objects/restore/RestoreBackupImportScreen';
import SettingsScreen, { SettingsButton } from '../page-objects/SettingsScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { bffLogin, createCredentialSchema } from '../utils/bff-api';
import { verifyButtonEnabled } from '../utils/button';
import { CredentialFormat, Transport } from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';

describe('ONE-1530: Backup & Restore', () => {
  let authToken: string;

  describe('Onboarding', () => {
    beforeAll(async () => {
      await device.launchApp({
        languageAndLocale: {
          language: 'en-US',
          locale: 'en-US',
        },
        permissions: { camera: 'YES' },
      });
    });

    it('User can restore from onboarding screen', async () => {
      await OnboardingSetupScreen.restoreButton.tap();
      await expect(RestoreBackupDashboardScreen.screen).toBeVisible();
      await RestoreBackupDashboardScreen.restoreButton.tap();
      await expect(RestoreBackupImportScreen.screen).toBeVisible();
      await expect(RestoreBackupImportScreen.importButton).toBeVisible();
      await verifyButtonEnabled(RestoreBackupImportScreen.importButton, false);
    });
  });

  describe('Restore proccess', () => {
    let credentialId: string;
    let credentialSchemaJWT: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      authToken = await bffLogin();
      credentialSchemaJWT = await createCredentialSchema(authToken, {
        format: CredentialFormat.JWT,
      });
      await device.launchApp({
        languageAndLocale: {
          language: 'en-US',
          locale: 'en-US',
        },
        permissions: { camera: 'YES' },
      });
    });

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        transport: Transport.PROCIVIS,
      });
    });

    beforeEach(async () => {
      await reloadApp();
    });

    it('User can create backup from settings', async () => {
      await expect(WalletScreen.screen).toBeVisible();
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.button(SettingsButton.CREATE_BACKUP).tap();
      await expect(CreateBackupDashboardScreen.screen).toBeVisible();
      await CreateBackupDashboardScreen.newBackupButton.tap();
      await expect(BackupRecoveryPasswordScreen.screen).toBeVisible();
      await verifyButtonEnabled(
        BackupRecoveryPasswordScreen.setPasswordButton,
        false,
      );
      const password = 'tester';
      await BackupRecoveryPasswordScreen.password(password);
      // hide a keyboard
      await device.pressBack();
      await BackupRecoveryPasswordScreen.reEnterPassword(password);
      // hide a keyboard
      await device.pressBack();
      await BackupRecoveryPasswordScreen.setPasswordButton.tap();
      await expect(BackupPreviewScreen.screen).toBeVisible();
      await BackupPreviewScreen.verifyCredentialVisible(credentialId);
      await BackupPreviewScreen.continueButton.tap();
      await expect(CreateBackupProcessingScreen.screen).toBeVisible();
      await expect(CreateBackupProcessingScreen.status.success).toBeVisible();
      await expect(CreateBackupProcessingScreen.ctaButton).toBeVisible();
    });

    it('User can restore backup from settings', async () => {
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.button(SettingsButton.RESTORE_BACKUP).tap();
      await expect(RestoreBackupDashboardScreen.screen).toBeVisible();
      await RestoreBackupDashboardScreen.restoreButton.tap();
      await expect(RestoreBackupImportScreen.screen).toBeVisible();
      await expect(RestoreBackupImportScreen.importButton).toBeVisible();
      await verifyButtonEnabled(RestoreBackupImportScreen.importButton, false);
    });
  });
});
