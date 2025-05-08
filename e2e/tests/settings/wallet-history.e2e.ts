import { expect } from 'detox';

import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import CredentialAcceptProcessScreen from '../../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../../page-objects/CredentialOfferScreen';
import HistoryScreen from '../../page-objects/HistoryScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import {
  createCredential,
  createCredentialSchema,
  keycloakAuth,
  offerCredential,
} from '../../utils/api';
import { CredentialFormat, IssuanceProtocol } from '../../utils/enums';
import { launchApp } from '../../utils/init';
import { scanURL } from '../../utils/scan';

describe('ONE-224: Wallet history', () => {
  let authToken: string;
  let credentialSchemaJWT: CredentialSchemaResponseDTO;
  let credentialId: string;

  beforeAll(async () => {
    await launchApp();

    authToken = await keycloakAuth();
    credentialSchemaJWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JWT,
      }),
    );
  });

  it('Empty history list', async () => {
    await expect(WalletScreen.screen).toBeVisible(1);
    await WalletScreen.settingsButton.tap();
    await expect(SettingsScreen.screen).toBeVisible(1);
    await SettingsScreen.button(SettingsButton.HISTORY).tap();
    await expect(HistoryScreen.screen).toBeVisible(1);
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
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.button(SettingsButton.HISTORY).tap();
      await expect(HistoryScreen.screen).toBeVisible(1);
    });

    it('Search field. No results', async () => {
      await expect(HistoryScreen.screen).toBeVisible(1);
      await expect(
        HistoryScreen.historyEntryList.historyRow(1).element,
      ).toBeVisible();
      await HistoryScreen.searchField.typeText('text\n');
      await HistoryScreen.verifyContainsText('No entries');
      await HistoryScreen.verifyContainsText(
        'You have not interacted with your wallet yet.',
      );
    });

    it('Search field. Found result', async () => {
      await expect(HistoryScreen.screen).toBeVisible(1);
      await HistoryScreen.searchField.clearText();
      await waitFor(HistoryScreen.historyEntryList.historyRow(0).element)
        .toBeVisible()
        .withTimeout(2000);
      await expect(
        HistoryScreen.historyEntryList.historyRow(1).element,
      ).toBeVisible();
      await HistoryScreen.searchField.typeText('string\n');
      await expect(
        HistoryScreen.historyEntryList.historyRow(0).element,
      ).toBeVisible();
      await expect(
        HistoryScreen.historyEntryList.historyRow(1).element,
      ).toBeVisible();
      await HistoryScreen.searchField.clearButton.tap();
    });

    it('Filter select', async () => {
      await expect(HistoryScreen.screen).toBeVisible(1);
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
        const invitationUrls = await offerCredential(credentialId, authToken);
        await scanURL(invitationUrls.url);
        await expect(CredentialOfferScreen.screen).toBeVisible(1);
        await CredentialOfferScreen.acceptButton.tap();
        await expect(CredentialAcceptProcessScreen.screen).toBeVisible(1);
        await expect(
          CredentialAcceptProcessScreen.status.success,
        ).toBeVisible();

        await CredentialAcceptProcessScreen.closeButton.tap();
        await expect(WalletScreen.screen).toBeVisible(1);
        await expect(
          (
            await WalletScreen.credentialAtIndex(i)
          ).element,
        ).toBeVisible();
      }
    });

    it('Scroll 25 elements', async () => {
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.button(SettingsButton.HISTORY).tap();
      await expect(HistoryScreen.screen).toBeVisible(1);

      await expect(
        HistoryScreen.historyEntryList.historyRow(4).element,
      ).toBeVisible();

      await HistoryScreen.scrollTo(16);

      await expect(
        HistoryScreen.historyEntryList.historyRow(16).element,
      ).toBeVisible();
    });
  });
});
