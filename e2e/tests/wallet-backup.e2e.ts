import { device, expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import { getCredentialSchemaData } from '../helpers/credentialSchemas';
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
import { createCredentialSchema,keycloakAuth } from '../utils/api';
import { verifyButtonEnabled } from '../utils/button';
import { CredentialFormat, IssuanceProtocol } from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';

describe('ONE-1530: Backup & Restore', () => {
  let authToken: string;

  beforeAll(async () => {
    authToken = await keycloakAuth();
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
      await expect(RestoreBackupDashboardScreen.screen).toBeVisible(1);
      await RestoreBackupDashboardScreen.restoreButton.tap();
      await expect(RestoreBackupImportScreen.screen).toBeVisible(1);
      await expect(RestoreBackupImportScreen.importButton).toBeVisible();
      await verifyButtonEnabled(RestoreBackupImportScreen.importButton, false);
    });
  });

  describe('Restore proccess', () => {
    let credentialSchemaJWT: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialSchemaJWT = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.JWT,
        }),
      );
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    beforeEach(async () => {
      await reloadApp();
    });

    it('User can create backup from settings', async () => {
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.button(SettingsButton.CREATE_BACKUP).tap();
      await expect(CreateBackupDashboardScreen.screen).toBeVisible(1);
      await CreateBackupDashboardScreen.newBackupButton.tap();
      await expect(CreateBackupSetPasswordScreen.screen).toBeVisible(1);
      await verifyButtonEnabled(
        CreateBackupSetPasswordScreen.setPasswordButton,
        false,
      );
      const password = 'tester';
      await CreateBackupSetPasswordScreen.fillPassword(`${password}\n`); // \n provide clicking "setPasswordButton"

      await expect(CreateBackupCheckPasswordScreen.screen).toBeVisible(1);
      await verifyButtonEnabled(
        CreateBackupCheckPasswordScreen.submitButton,
        false,
      );

      if (device.getPlatform() === 'ios') {
        // hiding keyboard not supported for iOS by detox, submit form using keyboard with \n
        await CreateBackupCheckPasswordScreen.fillPassword(`${password}\n`);
      } else {
        await CreateBackupCheckPasswordScreen.fillPassword(password, {
          pressBack: true,
        });
        await verifyButtonEnabled(
          CreateBackupCheckPasswordScreen.submitButton,
          true,
        );
        await CreateBackupCheckPasswordScreen.submitButton.tap();
      }

      await expect(CreateBackupPreviewScreen.screen).toBeVisible(1);
      await (
        await CreateBackupPreviewScreen.credentialAtIndex(0)
      ).verifyIsVisible();
      // Will be opened folder navigation and it will block the app
      // await CreateBackupPreviewScreen.createBackupButton.longPress(4001);
      // await expect(CreateBackupProcessingScreen.screen).toBeVisible(1);
      // await waitForElementVisible(CreateBackupProcessingScreen.closeButton, DEFAULT_WAIT_TIME);
      // await CreateBackupProcessingScreen.closeButton.tap();
      // await waitForElementVisible(element(by.text('SAVE')), DEFAULT_WAIT_TIME);
      // await delay(5000);
      // Cannot interact with android system for not to skip backup creation history - Error: Wait for [com.wix.detox.reactnative.idlingresources.uimodule.fabric.FabricUIManagerIdlingResources] to become idle timed out
      // await element(by.text('SAVE')).tap();
    });

    it('User can restore backup from settings', async () => {
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.button(SettingsButton.RESTORE_BACKUP).tap();
      await expect(RestoreBackupDashboardScreen.screen).toBeVisible(1);
      await RestoreBackupDashboardScreen.restoreButton.tap();
      await expect(RestoreBackupImportScreen.screen).toBeVisible(1);
      await expect(RestoreBackupImportScreen.importButton).toBeVisible();
      await verifyButtonEnabled(RestoreBackupImportScreen.importButton, false);
    });
  });

  describe('ONE-1796: Password strength', () => {
    beforeAll(async () => {
      await launchApp({ delete: true });
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.button(SettingsButton.CREATE_BACKUP).tap();
      await expect(CreateBackupDashboardScreen.screen).toBeVisible(1);
      await CreateBackupDashboardScreen.newBackupButton.tap();
      await expect(CreateBackupSetPasswordScreen.screen).toBeVisible(1);
      await verifyButtonEnabled(
        CreateBackupSetPasswordScreen.setPasswordButton,
        false,
      );
      await expect(CreateBackupSetPasswordScreen.screen).toBeVisible(1);
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
