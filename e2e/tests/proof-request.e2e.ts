import { expect } from 'detox';

import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import ProofRequestAcceptProcessScreen from '../page-objects/ProofRequestAcceptProcessScreen';
import ProofRequestSharingScreen from '../page-objects/ProofRequestScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { bffLogin, createCredential, createProofRequest, offerCredential, requestProof } from '../utils/bff-api';
import { verifyButtonEnabled } from '../utils/button';
import { pinSetup } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-614: Proof request', () => {
  describe('Proof request with Credentials', () => {
    beforeAll(async () => {
      await device.launchApp({ permissions: { camera: 'YES' }, delete: true });
      await pinSetup();
      const authToken = await bffLogin();
      const credentialId = await createCredential(authToken);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);
      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();
      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    beforeEach(async () => {
      const authToken = await bffLogin();
      const proofRequestId = await createProofRequest(authToken);
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
    });

    it('Confirm proof request', async () => {
      await ProofRequestSharingScreen.shareButton.tap();
      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
      await ProofRequestAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Reject proof request', async () => {
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });

  describe('Proof request without credentials', () => {
    beforeEach(async () => {
      await device.launchApp({ permissions: { camera: 'YES' }, delete: true });
      await pinSetup();
    });

    it('Without credentials', async () => {
      const authToken = await bffLogin();
      const proofRequestId = await createProofRequest(authToken);
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);
    });
  });
});
