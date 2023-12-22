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
import { CredentialFormat, Transport } from '../utils/enums';
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
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    const proofRequestSharingTestCase = async (redirectUri?: string | null) => {
      const proofRequestId = await createProofRequest(authToken, proofSchema, { redirectUri });
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
    };

    it('Confirm proof request', async () => {
      await proofRequestSharingTestCase();
      await ProofRequestSharingScreen.shareButton.tap();

      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
      await expect(ProofRequestAcceptProcessScreen.status.success).toBeVisible();

      await ProofRequestAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Confirm proof request with redirect URI', async () => {
      await proofRequestSharingTestCase('https://example.com');
      await ProofRequestSharingScreen.shareButton.tap();

      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
      await expect(ProofRequestAcceptProcessScreen.status.success).toBeVisible();
      await expect(ProofRequestAcceptProcessScreen.ctaButton).toBeVisible();
    });

    it('Reject proof request', async () => {
      await proofRequestSharingTestCase();
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
        await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
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
  describe('Proof request Transport Protocol TestCase', () => {
    beforeAll(async () => {
      await device.launchApp({ permissions: { camera: 'YES' }, delete: true });
      await pinSetup();
    });

    const proofRequestSharingTestCase = async (
      credentialSchemaFormat: CredentialFormat,
      credentialTransport: Transport,
      proofRequestTransport: Transport,
    ) => {
      const specificCredentialSchema = await createCredentialSchema(authToken, { format: credentialSchemaFormat });
      const credentialId = await createCredential(authToken, specificCredentialSchema, {
        transport: credentialTransport,
      });
      const credentialInvitationUrl = await offerCredential(credentialId, authToken);

      await scanURL(credentialInvitationUrl);
      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();
      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();

      const specificProofSchema = await createProofSchema(authToken, specificCredentialSchema);
      const proofRequestId = await createProofRequest(authToken, specificProofSchema, {
        transport: proofRequestTransport,
      });
      const proofInvitationUrl = await requestProof(proofRequestId, authToken);

      await scanURL(proofInvitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await ProofRequestSharingScreen.shareButton.tap();
      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
      await expect(ProofRequestAcceptProcessScreen.status.success).toBeVisible();
      await ProofRequestAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    };

    describe('Procivis Proof request transport', () => {
      // eslint-disable-next-line jest/expect-expect
      it('Proof request: JWT schema; Credential transport Procivis; Proof Transport: Procivis', async () => {
        await proofRequestSharingTestCase(CredentialFormat.JWT, Transport.PROCIVIS, Transport.PROCIVIS);
      });

      // eslint-disable-next-line jest/expect-expect
      it('Proof request: SD-JWT schema; Credential transport Procivis; Proof Transport: Procivis', async () => {
        await proofRequestSharingTestCase(CredentialFormat.SDJWT, Transport.PROCIVIS, Transport.PROCIVIS);
      });

      // eslint-disable-next-line jest/expect-expect
      it('Proof request: JWT schema; Credential transport OpenID4VC; Proof Transport: Procivis', async () => {
        await proofRequestSharingTestCase(CredentialFormat.JWT, Transport.OPENID4VC, Transport.PROCIVIS);
      });

      // eslint-disable-next-line jest/expect-expect
      it('Proof request: SD-JWT schema; Credential transport OpenID4VC; Proof Transport: Procivis', async () => {
        await proofRequestSharingTestCase(CredentialFormat.SDJWT, Transport.OPENID4VC, Transport.PROCIVIS);
      });
    });

    describe('ONE-795: OpenID4VC Proof request transport', () => {
      // eslint-disable-next-line jest/expect-expect
      it('Proof request: JWT schema; Credential transport Procivis; Proof Transport: OpenID4VC', async () => {
        await proofRequestSharingTestCase(CredentialFormat.JWT, Transport.PROCIVIS, Transport.OPENID4VC);
      });

      // eslint-disable-next-line jest/expect-expect
      it('Proof request: SD-JWT schema; Credential transport Procivis; Proof Transport: OpenID4VC', async () => {
        await proofRequestSharingTestCase(CredentialFormat.SDJWT, Transport.PROCIVIS, Transport.OPENID4VC);
      });

      // eslint-disable-next-line jest/expect-expect
      it('Proof request: JWT schema; Credential transport OpenID4VC; Proof Transport: OpenID4VC', async () => {
        await proofRequestSharingTestCase(CredentialFormat.JWT, Transport.OPENID4VC, Transport.OPENID4VC);
      });

      // eslint-disable-next-line jest/expect-expect
      it('Proof request: SD-JWT schema; Credential transport OpenID4VC; Proof Transport: OpenID4VC', async () => {
        await proofRequestSharingTestCase(CredentialFormat.SDJWT, Transport.OPENID4VC, Transport.OPENID4VC);
      });
    });
  });
});
