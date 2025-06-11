import { expect } from 'detox';

import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import { ProofAction, proofSchemaCreate, proofSharing } from '../../helpers/proof-request';
import { HistoryEntryEnum } from '../../page-objects/components/HistoryEntryList';
import { LoaderViewState } from '../../page-objects/components/LoadingResult';
import CredentialDetailScreen from '../../page-objects/credential/CredentialDetailScreen';
import CredentialAcceptProcessScreen from '../../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../../page-objects/CredentialOfferScreen';
import HistoryScreen from '../../page-objects/HistoryScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { ProofSchemaResponseDTO } from '../../types/proof';
import {
  createCredential,
  createCredentialSchema,
  deleteProofRequest,
  keycloakAuth,
  offerCredential,
} from '../../utils/api';
import { CredentialFormat, IssuanceProtocol, VerificationProtocol } from '../../utils/enums';
import { launchApp } from '../../utils/init';
import { scanURL } from '../../utils/scan';

enum HistoryProofExpect {
  REJECTED,
  ACCEPTED,
  ERRORED,
};

interface CheckProofRequest {
  action: HistoryProofExpect;
}

const checkProofRequest = async ({action}: CheckProofRequest) => {
  await expect(WalletScreen.screen).toBeVisible(1);
  await WalletScreen.settingsButton.tap();
  await expect(SettingsScreen.screen).toBeVisible(1);
  await SettingsScreen.button(SettingsButton.HISTORY).tap();
  await expect(HistoryScreen.screen).toBeVisible(1);
  const row_0_0 = HistoryScreen.historyEntryList.historyRow(0);
  await expect(row_0_0.element).toBeVisible();

  const row_0_1 = HistoryScreen.historyEntryList.historyRow(1);
  await expect(row_0_1.element).toBeVisible();
  if (action === HistoryProofExpect.ACCEPTED) {
    await expect(row_0_0.label).toHaveText(HistoryEntryEnum.PROOF_ACCEPTED);
  } else if (action === HistoryProofExpect.REJECTED) {
    await expect(row_0_0.label).toHaveText(HistoryEntryEnum.PROOF_REJECTED);
  } else if (action === HistoryProofExpect.ERRORED) {
    await expect(row_0_0.label).toHaveText(HistoryEntryEnum.PROOF_ERRORED);
  }
  await expect(row_0_1.label).toHaveText(HistoryEntryEnum.PROOF_REQUESTED);

  await HistoryScreen.back.tap();
  await SettingsScreen.back.tap();

  await WalletScreen.openDetailScreen(0);
  await CredentialDetailScreen.screen.waitForScreenVisible();

  const row_1_0 = CredentialDetailScreen.historyEntryList.historyRow(0);
  const row_1_1 = CredentialDetailScreen.historyEntryList.historyRow(1);

  if (action === HistoryProofExpect.ACCEPTED) {
    await expect(row_1_0.label).toHaveText(HistoryEntryEnum.PROOF_ACCEPTED);
    await expect(row_1_1.label).toHaveText(HistoryEntryEnum.PROOF_REQUESTED);
  } else if (action === HistoryProofExpect.REJECTED) {
    await expect(row_1_0.label).toHaveText(HistoryEntryEnum.PROOF_REJECTED);
    await expect(row_1_1.label).toHaveText(HistoryEntryEnum.PROOF_REQUESTED);
  } else if (action === HistoryProofExpect.ERRORED) {
    await expect(row_1_0.label).toHaveText(HistoryEntryEnum.PROOF_ERRORED);
  }
}

describe('ONE-224: Wallet history', () => {
  let authToken: string;
  let credentialSchemaJWT: CredentialSchemaResponseDTO;
  let credentialId: string;
  let proofSchema: ProofSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();

    authToken = await keycloakAuth();
    credentialSchemaJWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JWT,
      }),
    );
    proofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [credentialSchemaJWT],
      validityConstraint: 888,
    });
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

  describe('ONE-4834: Proof request log entries', () => {
    beforeAll(async () => {
      await launchApp({ delete: true });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Success history entries', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
      });
      await checkProofRequest({action: HistoryProofExpect.ACCEPTED});
    });

    // Bug: ONE-6176
    it('Sharing rejected history entries', async () => {
      await proofSharing(authToken, {
        action: ProofAction.REJECT,
        data: {
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
      });
      await checkProofRequest({action: HistoryProofExpect.REJECTED});
    });

    it('Sharing failed history entries', async () => {
      const customShareDataScreenTest = async (proofRequestId: string) => {
        await deleteProofRequest(authToken, proofRequestId);
      };

      await proofSharing(authToken, {
        action: ProofAction.SHARE,
        data: {
          customShareDataScreenTest,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
        expectedResult: LoaderViewState.Warning,
      });
      await checkProofRequest({action: HistoryProofExpect.ERRORED});
    });
  });
});
