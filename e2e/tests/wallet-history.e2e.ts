import { expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import HistoryDetailScreen from '../page-objects/HistoryDetailScreen';
import HistoryScreen from '../page-objects/HistoryScreen';
import SettingsScreen, { SettingsButton } from '../page-objects/SettingsScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredential,
  createCredentialSchema,
  offerCredential,
} from '../utils/bff-api';
import { CredentialFormat, Exchange } from '../utils/enums';
import { launchApp } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-224: Wallet history', () => {
  let authToken: string;
  let credentialSchemaJWT: CredentialSchemaResponseDTO;
  let credentialId: string;

  beforeAll(async () => {
    await launchApp();

    authToken = await bffLogin();
    credentialSchemaJWT = await createCredentialSchema(authToken, {
      format: CredentialFormat.JWT,
    });
  });

  it('Empty history list', async () => {
    await expect(WalletScreen.screen).toBeVisible();
    await WalletScreen.settingsButton.tap();
    await expect(SettingsScreen.screen).toBeVisible();
    await SettingsScreen.button(SettingsButton.HISTORY).tap();
    await expect(HistoryScreen.screen).toBeVisible();
    await HistoryScreen.verifyContainsText('No entries');
    await HistoryScreen.verifyContainsText(
      'You have not interacted with your wallet yet.',
    );
    await HistoryScreen.back.tap();
  });

  describe('Non empty list', () => {
    beforeAll(async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: Exchange.OPENID4VC,
      });
      await expect(WalletScreen.screen).toBeVisible();
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.button(SettingsButton.HISTORY).tap();
      await expect(HistoryScreen.screen).toBeVisible();
    });

    it('Contain 2 records after issued credential', async () => {
      const record_0 = HistoryScreen.history(0);
      await expect(record_0.element).toBeVisible();
      await expect(record_0.label).toHaveText('Credential issued');
      await expect(record_0.timeLabel).toBeVisible();
      await expect(record_0.info).toBeVisible();

      const record_1 = HistoryScreen.history(1);
      await expect(record_1.element).toBeVisible();
      await expect(record_1.label).toHaveText('Credential pending');
      await expect(record_1.timeLabel).toBeVisible();
      await expect(record_1.info).toBeVisible();
    });

    it('Contain records. Open detail screen', async () => {
      await expect(HistoryScreen.history(1).element).toBeVisible();
      await HistoryScreen.history(1).element.tap();
      await expect(HistoryDetailScreen.screen).toBeVisible();
      await HistoryDetailScreen.back.tap();
    });

    it('Search field. No results', async () => {
      await expect(HistoryScreen.screen).toBeVisible();
      await expect(HistoryScreen.history(1).element).toBeVisible();
      await HistoryScreen.searchField.typeText('text\n');
      await HistoryScreen.verifyContainsText('No entries');
      await HistoryScreen.verifyContainsText(
        'You have not interacted with your wallet yet.',
      );
    });

    it('Search field. Found result', async () => {
      await expect(HistoryScreen.screen).toBeVisible();
      await HistoryScreen.searchField.clearText();
      await waitFor(HistoryScreen.history(0).element)
        .toBeVisible()
        .withTimeout(2000);
      await expect(HistoryScreen.history(1).element).toBeVisible();
      await HistoryScreen.searchField.typeText('string\n');
      await expect(HistoryScreen.history(0).element).toBeVisible();
      await expect(HistoryScreen.history(1).element).toBeVisible();
      await HistoryScreen.searchField.clearButton.tap();
    });

    it('Filter select', async () => {
      await expect(HistoryScreen.screen).toBeVisible();
      await HistoryScreen.filter.open();
      await HistoryScreen.filter.scrollTo(credentialSchemaJWT.name);
      await HistoryScreen.filter.close();
    });
  });

  // Long tests
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('Scroll elements', () => {
    beforeAll(async () => {
      const times = 6;

      for (let i = 0; i < times; i++) {
        credentialId = await createCredential(authToken, credentialSchemaJWT);
        const invitationUrl = await offerCredential(credentialId, authToken);
        await scanURL(invitationUrl);
        await expect(CredentialOfferScreen.screen).toBeVisible();
        await CredentialOfferScreen.acceptButton.tap();
        await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
        await expect(
          CredentialAcceptProcessScreen.status.success,
        ).toBeVisible();

        await CredentialAcceptProcessScreen.closeButton.tap();
        await expect(WalletScreen.screen).toBeVisible();
        await expect(
          (
            await WalletScreen.credentialAtIndex(i)
          ).element,
        ).toBeVisible();
      }
    });

    it('Scroll 25 elements', async () => {
      await expect(WalletScreen.screen).toBeVisible();
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible();
      await SettingsScreen.button(SettingsButton.HISTORY).tap();
      await expect(HistoryScreen.screen).toBeVisible();

      await expect(HistoryScreen.history(4).element).toBeVisible();

      await HistoryScreen.scrollTo(16);

      await expect(HistoryScreen.history(16).element).toBeVisible();
    });
  });
});
