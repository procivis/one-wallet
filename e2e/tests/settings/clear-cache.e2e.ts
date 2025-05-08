import { expect } from 'detox';

import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import { createTrustEntityWithDefaultAnchor } from '../../helpers/trustEntity';
import { CredentialStatus } from '../../page-objects/components/CredentialCard';
import CredentialDetailScreen, {
  Action,
} from '../../page-objects/credential/CredentialDetailScreen';
import CredentialNerdScreen from '../../page-objects/credential/CredentialNerdScreen';
import CredentialUpdateProcessScreen from '../../page-objects/credential/CredentialUpdateProcessScreen';
import ClearCacheScreen, {
  ClearOptions,
} from '../../page-objects/settings/ClearCacheScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import StatusCheckResultScreen from '../../page-objects/StatusCheckResultScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { DidDetailDTO } from '../../types/did';
import {
  keycloakAuth,
  createCredentialSchema,
  createDidWithKey,
  revokeCredential,
  suspendCredential,
} from '../../utils/api';
import {
  CredentialFormat,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../../utils/enums';
import { launchApp } from '../../utils/init';
import { statusScreenCheck } from '../../utils/status-check';

enum Expected {
  NO_UPDATES,
  REVORED,
  SUSPENDED,
}

describe('ONE-4505: Clear cache & refresh credential', () => {
  let authToken: string;
  let credentialSchemaJWT: CredentialSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();
    console.log('authToken', authToken);
    credentialSchemaJWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        allowSuspension: true,
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
        walletStorageType: WalletKeyStorageType.SOFTWARE,
      }),
    );
  });

  describe('Clear cache screen', () => {
    beforeAll(async () => {
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.settingsButton.tap();
    });

    beforeEach(async () => {
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.scrollTo(SettingsButton.CLEAR_CACHE);
      await SettingsScreen.button(SettingsButton.CLEAR_CACHE).tap();
      await expect(ClearCacheScreen.screen).toBeVisible(1);
    });

    it('Clear all caches', async () => {
      await ClearCacheScreen.clearOptionsRadioButon.select(
        ClearOptions.AllCaches,
      );
      await ClearCacheScreen.clearButton.tap(4000);
      await expect(SettingsScreen.screen).toBeVisible(1);
    });

    it('Clear revocation & trust data', async () => {
      await ClearCacheScreen.clearOptionsRadioButon.select(
        ClearOptions.RevocationAndTrustData,
      );
      await ClearCacheScreen.clearButton.tap(4000);
      await expect(SettingsScreen.screen).toBeVisible(1);
    });
  });

  describe('Refresh credential', () => {
    let credentialId: string;

    const refreshCredentialTest = async (index: number, expected: Expected) => {
      const card_0 = await WalletScreen.credentialAtIndex(index);
      await card_0.openDetail();

      if (expected === Expected.REVORED) {
        await revokeCredential(credentialId, authToken);
      } else if (expected === Expected.SUSPENDED) {
        await suspendCredential(credentialId, authToken);
      }

      await CredentialDetailScreen.screen.waitForScreenVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action(Action.REFRESH_CREDENTIAL).tap();
      if (expected === Expected.NO_UPDATES) {
        await expect(CredentialUpdateProcessScreen.screen).toBeVisible(1);
        await expect(
          CredentialUpdateProcessScreen.status.success,
        ).toBeVisible();
        await CredentialUpdateProcessScreen.closeButton.tap();
      } else {
        await waitFor(StatusCheckResultScreen.screen)
          .toBeVisible(1)
          .withTimeout(5000);
        if (expected === Expected.REVORED) {
          await statusScreenCheck([
            { index: 0, status: CredentialStatus.REVOKED },
          ]);
        } else if (expected === Expected.SUSPENDED) {
          await statusScreenCheck([
            { index: 0, status: CredentialStatus.SUSPENDED },
          ]);
        }
        await StatusCheckResultScreen.closeButton.tap();
      }
      await CredentialDetailScreen.screen.waitForScreenVisible();
    };

    beforeAll(async () => {});

    beforeEach(async () => {
      const credentialIds = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      credentialId = credentialIds.issuerCredentialId;
    });

    it('Refresh credential: No updates', async () => {
      await refreshCredentialTest(0, Expected.NO_UPDATES);
    });

    it('Refresh credential: Revoke status update', async () => {
      await refreshCredentialTest(0, Expected.REVORED);
    });

    it('Refresh credential: Suspend status update', async () => {
      await refreshCredentialTest(0, Expected.SUSPENDED);
    });
  });

  describe('Refresh trust entity', () => {
    let didDetail: DidDetailDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      didDetail = await createDidWithKey(authToken, {
        didMethod: DidMethod.WEB,
        keyType: KeyType.EDDSA,
      });
    });

    beforeEach(async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        didData: didDetail,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Trusted DID after refresh credential', async () => {
      // Verify Unknown TrustEntity issuer
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
      await expect(CredentialNerdScreen.screen).toBeVisible(1);
      await expect(CredentialNerdScreen.entityCluster.name).toHaveText(
        'Unknown issuer',
      );
      await CredentialNerdScreen.back.tap();
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await CredentialDetailScreen.backButton.tap();

      // Make Issuer DID trusted
      const trustEntityDetail = await createTrustEntityWithDefaultAnchor(
        authToken,
        didDetail.id,
      );

      // Cache cleaning
      await WalletScreen.settingsButton.tap();
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.scrollTo(SettingsButton.CLEAR_CACHE);
      await SettingsScreen.button(SettingsButton.CLEAR_CACHE).tap();
      await expect(ClearCacheScreen.screen).toBeVisible(1);
      await ClearCacheScreen.clearOptionsRadioButon.select(
        ClearOptions.RevocationAndTrustData,
      );
      await ClearCacheScreen.clearButton.tap(4000);
      await expect(SettingsScreen.screen).toBeVisible(1);
      await SettingsScreen.back.tap();

      // Check trust entity cache refreshed
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
      await expect(CredentialNerdScreen.screen).toBeVisible(1);
      await waitFor(CredentialNerdScreen.entityCluster.name)
        .toHaveText(trustEntityDetail.name)
        .withTimeout(10000);
    });
  });
});
