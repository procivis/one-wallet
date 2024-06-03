import { expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import CreateBackupProcessingScreen from '../page-objects/backup/BackupProcessingScreen';
import CreateBackupCheckPasswordScreen from '../page-objects/backup/CreateBackupCheckPasswordScreen';
import CreateBackupDashboardScreen from '../page-objects/backup/CreateBackupDashboardScreen';
import CreateBackupPreviewScreen from '../page-objects/backup/CreateBackupPreviewScreen';
import CreateBackupSetPasswordScreen, {
  Tip,
} from '../page-objects/backup/CreateBackupSetPasswordScreen';
import OnboardingSetupScreen from '../page-objects/onboarding/OnboardingSetupScreen';
import RestoreBackupDashboardScreen from '../page-objects/restore/RestoreBackupDashboardScreen';
import RestoreBackupImportScreen from '../page-objects/restore/RestoreBackupImportScreen';
import SettingsScreen, { SettingsButton } from '../page-objects/SettingsScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { bffLogin, createCredentialSchema } from '../utils/bff-api';
import { verifyButtonEnabled } from '../utils/button';
import { CredentialFormat, Exchange } from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';

describe('ONE-1530: Backup & Restore', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await bffLogin();
  });

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
      await launchApp({ delete: true });
      credentialSchemaJWT = await createCredentialSchema(authToken, {
        format: CredentialFormat.JWT,
      });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: Exchange.PROCIVIS,
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
      await expect(CreateBackupSetPasswordScreen.screen).toBeVisible();
      await verifyButtonEnabled(
        CreateBackupSetPasswordScreen.setPasswordButton,
        false,
      );
      const password = 'tester';
      await CreateBackupSetPasswordScreen.fillPassword(`${password}\n`); // \n provide clicking "setPasswordButton"

      await expect(CreateBackupCheckPasswordScreen.screen).toBeVisible();

      await verifyButtonEnabled(
        CreateBackupCheckPasswordScreen.submitButton,
        false,
      );
      await CreateBackupCheckPasswordScreen.password(password);
      await device.pressBack(); // hide a keyboard
      await verifyButtonEnabled(
        CreateBackupCheckPasswordScreen.submitButton,
        true,
      );
      await CreateBackupCheckPasswordScreen.submitButton.tap();

      await expect(CreateBackupPreviewScreen.screen).toBeVisible();
      await CreateBackupPreviewScreen.credentialCard(
        credentialId,
      ).verifyIsVisible();

      await CreateBackupPreviewScreen.createBackupButton.longPress(3001);
      await expect(CreateBackupProcessingScreen.screen).toBeVisible();
      await expect(CreateBackupProcessingScreen.status.success).toBeVisible();
      // await expect(CreateBackupProcessingScreen.ctaButton).toBeVisible();
    });

    it('User can restore backup from settings', async () => {
      await expect(WalletScreen.screen).toBeVisible();
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

  describe('ONE-1796: Password strength', () => {
    beforeAll(async () => {
      await launchApp({ delete: true });
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.button(SettingsButton.CREATE_BACKUP).tap();
      await expect(CreateBackupDashboardScreen.screen).toBeVisible();
      await CreateBackupDashboardScreen.newBackupButton.tap();
      await expect(CreateBackupSetPasswordScreen.screen).toBeVisible();
      await verifyButtonEnabled(
        CreateBackupSetPasswordScreen.setPasswordButton,
        false,
      );
      await expect(CreateBackupSetPasswordScreen.screen).toBeVisible();
    });

    it('Password: no chars', async () => {
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'satisfied',
        [],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'unsatisfied',
        [0, 1, 2, 3],
      );
    });

    it('Password: only number', async () => {
      await CreateBackupSetPasswordScreen.fillPassword('1', {
        pressBack: true,
      });
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'satisfied',
        [0],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyTipsAreVisible(
        [Tip.Number],
      );
    });

    it('Password: only numbers with length > 8', async () => {
      await CreateBackupSetPasswordScreen.fillPassword('1234512345', {
        pressBack: true,
      });
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'satisfied',
        [0],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyTipsAreVisible(
        [Tip.Number, Tip.Length],
      );
    });

    it('Password: only numbers', async () => {
      await CreateBackupSetPasswordScreen.fillPassword('1234512345', {
        pressBack: true,
      });
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'satisfied',
        [0],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyTipsAreVisible(
        [Tip.Number, Tip.Length],
      );
    });
    it('Contain uppercase letter', async () => {
      await CreateBackupSetPasswordScreen.fillPassword('Freedom22', {
        pressBack: true,
      });
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'satisfied',
        [0, 1],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'unsatisfied',
        [2, 3],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyTipsAreVisible(
        [Tip.Number, Tip.Length, Tip.Upper],
      );
    });

    it('Contain symbol', async () => {
      await CreateBackupSetPasswordScreen.fillPassword('Str@ngPass123', {
        pressBack: true,
      });
      await CreateBackupSetPasswordScreen.passwordStrength.verifyIndicatorLevel(
        'satisfied',
        [0, 1, 2, 3],
      );
      await CreateBackupSetPasswordScreen.passwordStrength.verifyTipsAreVisible(
        [Tip.Number, Tip.Length, Tip.Upper, Tip.Symbol],
      );
    });
  });
});
