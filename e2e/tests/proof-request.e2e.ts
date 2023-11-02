import { expect } from 'detox';

import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import ProofRequestAcceptProcessScreen from '../page-objects/ProofRequestAcceptProcessScreen';
import ProofRequestSharingScreen from '../page-objects/ProofRequestScreen';
import ProofRequestSelectCredentialScreen from '../page-objects/ProofRequestSelectCredentialScreen';
import WalletScreen from '../page-objects/WalletScreen';
import {
  bffLogin,
  createCredential,
  createCredentialSchema,
  createProofRequest,
  createProofSchema,
  offerCredential,
  requestProof,
  revokeCredential,
} from '../utils/bff-api';
import { verifyButtonEnabled } from '../utils/button';
import { pinSetup } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-614: Proof request', () => {
  let authToken: string;
  let credentialSchema: Record<string, any>;
  let proofSchema: Record<string, any>;

  beforeAll(async () => {
    authToken = await bffLogin();
    credentialSchema = await createCredentialSchema(authToken);
    proofSchema = await createProofSchema(authToken, credentialSchema);
  });

  describe('Proof request with valid credential', () => {
    beforeAll(async () => {
      await device.launchApp({ permissions: { camera: 'YES' }, delete: true });
      await pinSetup();
      const credentialId = await createCredential(authToken, credentialSchema);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);
      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();
      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    beforeEach(async () => {
      const proofRequestId = await createProofRequest(authToken, proofSchema);
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
      const proofRequestId = await createProofRequest(authToken);
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);
    });
  });

  describe('ONE-620: Revoked credentials', () => {
    const credentialIds: string[] = [];
    beforeAll(async () => {
      await device.launchApp({ permissions: { camera: 'YES' }, delete: true });
      await pinSetup();

      for (let i = 0; i < 3; i++) {
        const credentialId = await createCredential(authToken, credentialSchema);
        const invitationUrl = await offerCredential(credentialId, authToken);
        await scanURL(invitationUrl);
        await expect(CredentialOfferScreen.screen).toBeVisible();
        await CredentialOfferScreen.acceptButton.tap();
        await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
        await CredentialAcceptProcessScreen.closeButton.tap();
        credentialIds.push(credentialId);
      }
    });

    it('2 valid one revoked', async () => {
      await revokeCredential(credentialIds[2], authToken);
      const proofRequestId = await createProofRequest(authToken, proofSchema);
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);

      await expect(ProofRequestSharingScreen.credential(0).element).toBeVisible();
      await expect(ProofRequestSharingScreen.credential(0).title(credentialIds[1])).toExist();
      await expect(ProofRequestSharingScreen.credential(0).notice.multiple.element).toBeVisible();
      await ProofRequestSharingScreen.credential(0).notice.multiple.selectButton.tap();

      await expect(ProofRequestSelectCredentialScreen.screen).toBeVisible();
      await expect(ProofRequestSelectCredentialScreen.credential(credentialIds[0]).element).toExist();
      await expect(ProofRequestSelectCredentialScreen.credential(credentialIds[0]).unselected).toExist();
      // latest valid item is selected
      await expect(ProofRequestSelectCredentialScreen.credential(credentialIds[1]).element).toExist();
      await expect(ProofRequestSelectCredentialScreen.credential(credentialIds[1]).selected).toExist();

      await expect(ProofRequestSelectCredentialScreen.credential(credentialIds[2]).element).not.toExist();
      await ProofRequestSelectCredentialScreen.backButton.tap();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('2 revoked one valid', async () => {
      await revokeCredential(credentialIds[1], authToken);
      const proofRequestId = await createProofRequest(authToken, proofSchema);
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);

      await expect(ProofRequestSharingScreen.credential(0).element).toBeVisible();
      // no selection possible
      await expect(ProofRequestSharingScreen.credential(0).notice.multiple.element).not.toExist();
      await expect(ProofRequestSharingScreen.credential(0).title(credentialIds[0])).toExist();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('all revoked', async () => {
      await revokeCredential(credentialIds[0], authToken);
      const proofRequestId = await createProofRequest(authToken, proofSchema);
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);

      await expect(ProofRequestSharingScreen.credential(0).element).toBeVisible();
      await expect(ProofRequestSharingScreen.credential(0).subtitle.revoked).toExist();
      await expect(ProofRequestSharingScreen.credential(0).notice.revoked).toExist();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });
});
