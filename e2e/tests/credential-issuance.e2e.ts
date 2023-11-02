import { expect } from 'detox';

import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import PinCodeScreen from '../page-objects/PinCodeScreen';
import WalletScreen from '../page-objects/WalletScreen';
import {
  bffLogin,
  createCredential,
  createCredentialSchema,
  offerCredential,
  revokeCredential,
} from '../utils/bff-api';
import { pinSetup } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;
  let credentialSchema: Record<string, any>;

  beforeAll(async () => {
    await device.launchApp({ permissions: { camera: 'YES' } });
    await pinSetup();
    authToken = await bffLogin();
    credentialSchema = await createCredentialSchema(authToken);
  });

  describe('Credential offer', () => {
    let credentialId: string;

    beforeEach(async () => {
      credentialId = await createCredential(authToken, credentialSchema);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);

      await expect(CredentialOfferScreen.screen).toBeVisible();
    });

    it('Accept credential issuance', async () => {
      await CredentialOfferScreen.acceptButton.tap();

      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();

      await expect(WalletScreen.screen).toBeVisible();
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
    });

    it('Reject credential issuance', async () => {
      await CredentialOfferScreen.rejectButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });

  describe('ONE-620: Credential revocation', () => {
    let credentialId: string;

    beforeAll(async () => {
      credentialId = await createCredential(authToken, credentialSchema);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);

      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();
      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Credential not revoked initially', async () => {
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(WalletScreen.credential(credentialId).revokedLabel).not.toExist();
    });

    it('Credential revoked remotely', async () => {
      await revokeCredential(credentialId, authToken);
      await device.launchApp({ newInstance: true });
      await expect(PinCodeScreen.Check.screen).toBeVisible();
      await PinCodeScreen.Check.digit(1).multiTap(6);
      await expect(WalletScreen.screen).toBeVisible();

      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(WalletScreen.credential(credentialId).revokedLabel).toExist();
    });

    it('Revoked credential detail screen', async () => {
      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(CredentialDetailScreen.status.element).toBeVisible();
      await expect(CredentialDetailScreen.status.value).toHaveText('Revoked');
      await expect(CredentialDetailScreen.log('revoked')).toExist();
    });
  });
});
