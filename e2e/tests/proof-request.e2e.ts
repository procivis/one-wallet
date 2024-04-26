import { expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import ImagePreviewScreen from '../page-objects/ImagePreviewScreen';
import ProofRequestAcceptProcessScreen from '../page-objects/ProofRequestAcceptProcessScreen';
import ProofRequestSharingScreen from '../page-objects/ProofRequestScreen';
import ProofRequestSelectCredentialScreen from '../page-objects/ProofRequestSelectCredentialScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { CredentialSchemaData } from '../types/credentialSchema';
import { ProofSchemaResponseDTO } from '../types/proof';
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
import { CredentialFormat, RevocationMethod, Transport } from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-614: Proof request', () => {
  let authToken: string;
  let credentialSchema: CredentialSchemaResponseDTO;
  let proofSchema: Record<string, any>;

  beforeAll(async () => {
    await launchApp();
    authToken = await bffLogin();
    credentialSchema = await createCredentialSchema(authToken);
    proofSchema = await createProofSchema(authToken, [credentialSchema]);
  });

  describe('Proof request with valid credential', () => {
    beforeAll(async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        transport: Transport.OPENID4VC,
      });
    });

    const proofRequestSharingTestCase = async (redirectUri?: string) => {
      const proofRequestId = await createProofRequest(authToken, proofSchema, {
        redirectUri,
      });
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
    };

    it('Confirm proof request', async () => {
      await proofRequestSharingTestCase();
      await ProofRequestSharingScreen.shareButton.tap();

      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
      await expect(
        ProofRequestAcceptProcessScreen.status.success,
      ).toBeVisible();

      await ProofRequestAcceptProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Confirm proof request with redirect URI', async () => {
      await proofRequestSharingTestCase('https://example.com');
      await ProofRequestSharingScreen.shareButton.tap();

      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
      await expect(
        ProofRequestAcceptProcessScreen.status.success,
      ).toBeVisible();
      await expect(ProofRequestAcceptProcessScreen.ctaButton).toBeVisible();
    });

    it('Reject proof request', async () => {
      await proofRequestSharingTestCase();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });

  describe('ONE-1182: Selective disclosure', () => {
    let jwtCredentialSchema: CredentialSchemaResponseDTO;
    let sdjwtCredentialSchema: CredentialSchemaResponseDTO;
    let jwtProofSchema: Record<string, any>;
    let jwtCredentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });

      const claims: CredentialSchemaData['claims'] = [
        { datatype: 'STRING', key: 'field1', required: true },
        { datatype: 'STRING', key: 'field2', required: true },
      ];
      jwtCredentialSchema = await createCredentialSchema(authToken, {
        claims,
        format: CredentialFormat.JWT,
      });
      sdjwtCredentialSchema = await createCredentialSchema(authToken, {
        claims,
        format: CredentialFormat.SDJWT,
      });

      jwtProofSchema = await createProofSchema(authToken, [
        jwtCredentialSchema,
      ]);
      jwtCredentialId = await credentialIssuance({
        authToken: authToken,
        claimValues: [
          { claimId: jwtCredentialSchema.claims[0].id, value: 'value1' },
          { claimId: jwtCredentialSchema.claims[1].id, value: 'value2' },
        ],
        credentialSchema: jwtCredentialSchema,
        transport: Transport.PROCIVIS,
      });
    });

    it('displays selective disclosure notice and all claims', async () => {
      const proofRequestId = await createProofRequest(
        authToken,
        jwtProofSchema,
      );
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await expect(
        ProofRequestSharingScreen.credential(0).notice.selectiveDisclosure,
      ).toBeVisible();

      await expect(element(by.text('field1'))).toBeVisible();
      await expect(element(by.text('value1'))).toBeVisible();
      await expect(element(by.text('field2'))).toBeVisible();
      await expect(element(by.text('value2'))).toBeVisible();

      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);
    });

    it('displays selective disclosure notice on affected options', async () => {
      const sdjwtCredentialId = await createCredential(
        authToken,
        sdjwtCredentialSchema,
        {
          claimValues: [
            { claimId: sdjwtCredentialSchema.claims[0].id, value: 'value1' },
            { claimId: sdjwtCredentialSchema.claims[1].id, value: 'value2' },
          ],
        },
      );
      const sdjwtCredentialInvitationUrl = await offerCredential(
        sdjwtCredentialId,
        authToken,
      );
      await scanURL(sdjwtCredentialInvitationUrl);
      await CredentialOfferScreen.acceptButton.tap();
      await CredentialAcceptProcessScreen.closeButton.tap();

      const proofRequestId = await createProofRequest(
        authToken,
        jwtProofSchema,
      );
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await ProofRequestSharingScreen.credential(
        0,
      ).notice.multiple.selectButton.tap();

      await expect(ProofRequestSelectCredentialScreen.screen).toBeVisible();
      await expect(
        ProofRequestSelectCredentialScreen.credential(jwtCredentialId).element,
      ).toBeVisible();
      await expect(
        ProofRequestSelectCredentialScreen.credential(jwtCredentialId).notice
          .selectiveDisclosure,
      ).toBeVisible();

      await expect(
        ProofRequestSelectCredentialScreen.credential(sdjwtCredentialId)
          .element,
      ).toBeVisible();
      await expect(
        ProofRequestSelectCredentialScreen.credential(sdjwtCredentialId).notice
          .selectiveDisclosure,
      ).not.toExist();
    });
  });

  describe('Proof request without credentials', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
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
      await launchApp({ delete: true });

      for (let i = 0; i < 3; i++) {
        const credentialId = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchema,
          transport: Transport.OPENID4VC,
        });
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

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      await expect(
        ProofRequestSharingScreen.credential(0).title(credentialIds[1]),
      ).toExist();
      await expect(
        ProofRequestSharingScreen.credential(0).notice.multiple.element,
      ).toBeVisible();
      await ProofRequestSharingScreen.credential(
        0,
      ).notice.multiple.selectButton.tap();

      await expect(ProofRequestSelectCredentialScreen.screen).toBeVisible();
      await expect(
        ProofRequestSelectCredentialScreen.credential(credentialIds[0]).element,
      ).toExist();
      await expect(
        ProofRequestSelectCredentialScreen.credential(credentialIds[0])
          .unselected,
      ).toExist();
      // latest valid item is selected
      await expect(
        ProofRequestSelectCredentialScreen.credential(credentialIds[1]).element,
      ).toExist();
      await expect(
        ProofRequestSelectCredentialScreen.credential(credentialIds[1])
          .selected,
      ).toExist();

      await expect(
        ProofRequestSelectCredentialScreen.credential(credentialIds[2]).element,
      ).not.toExist();
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

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      // no selection possible
      await expect(
        ProofRequestSharingScreen.credential(0).notice.multiple.element,
      ).not.toExist();
      await expect(
        ProofRequestSharingScreen.credential(0).title(credentialIds[0]),
      ).toExist();
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

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      await expect(
        ProofRequestSharingScreen.credential(0).subtitle.revoked,
      ).toExist();
      await expect(
        ProofRequestSharingScreen.credential(0).notice.revoked,
      ).toExist();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });

  describe('ONE-1233: Picture claim', () => {
    const pictureKey = 'picture';
    let credentialId: string;
    let pictureProofSchema: Record<string, any>;

    beforeAll(async () => {
      await launchApp({ delete: true });

      const pictureCredentialSchema = await createCredentialSchema(authToken, {
        claims: [{ datatype: 'PICTURE', key: pictureKey, required: true }],
      });
      pictureProofSchema = await createProofSchema(authToken, [
        pictureCredentialSchema,
      ]);

      credentialId = await createCredential(authToken, pictureCredentialSchema);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);
      await CredentialOfferScreen.acceptButton.tap();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
    });

    it('displays picture link on sharing screen', async () => {
      const proofRequestId = await createProofRequest(
        authToken,
        pictureProofSchema,
      );
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);

      const credential = ProofRequestSharingScreen.credential(0);
      await expect(credential.element).toBeVisible();
      const pictureClaim = credential.claim(0);
      await expect(pictureClaim.element).toBeVisible();
      await expect(pictureClaim.title).toHaveText(pictureKey);
      await pictureClaim.value.tap();
      await expect(ImagePreviewScreen.screen).toBeVisible();
      await expect(ImagePreviewScreen.title).toHaveText(pictureKey);
    });
  });

  describe('Proof request Transport Protocol TestCase', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
    });

    interface TestCombination {
      credentialFormat: CredentialFormat;
      issuanceTransport: Transport;
      proofTransport: Transport;
    }

    const SUPPORTED = {
      credentialFormat: [CredentialFormat.JWT, CredentialFormat.SDJWT],
      issuanceTransport: [Transport.PROCIVIS, Transport.OPENID4VC],
      proofTransport: [Transport.PROCIVIS, Transport.OPENID4VC],
    };

    const COMBINATIONS = SUPPORTED.credentialFormat.flatMap(
      (credentialFormat) =>
        SUPPORTED.issuanceTransport.flatMap((issuanceTransport) =>
          SUPPORTED.proofTransport.flatMap<TestCombination>(
            (proofTransport) => ({
              credentialFormat,
              issuanceTransport,
              proofTransport,
            }),
          ),
        ),
    );

    it.each(COMBINATIONS)(
      'Proof request: %o',
      async ({ credentialFormat, issuanceTransport, proofTransport }) => {
        const specificCredentialSchema = await createCredentialSchema(
          authToken,
          { format: credentialFormat },
        );

        await credentialIssuance({
          authToken: authToken,
          credentialSchema: specificCredentialSchema,
          transport: issuanceTransport,
        });

        const specificProofSchema = await createProofSchema(authToken, [
          specificCredentialSchema,
        ]);
        const proofRequestId = await createProofRequest(
          authToken,
          specificProofSchema,
          { transport: proofTransport },
        );
        const proofInvitationUrl = await requestProof(
          proofRequestId,
          authToken,
        );

        await scanURL(proofInvitationUrl);
        await expect(ProofRequestSharingScreen.screen).toBeVisible();
        await ProofRequestSharingScreen.shareButton.tap();
        await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();
        await expect(
          ProofRequestAcceptProcessScreen.status.success,
        ).toBeVisible();
        await ProofRequestAcceptProcessScreen.closeButton.tap();
        await expect(WalletScreen.screen).toBeVisible();
      },
    );
  });

  describe('ONE-1316: Check validity of credential in proof request', () => {
    let proofSchemaLVVC: ProofSchemaResponseDTO;
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });

      credentialSchema = await createCredentialSchema(authToken, {
        revocationMethod: RevocationMethod.LVVC,
      });
      proofSchemaLVVC = await createProofSchema(authToken, [credentialSchema]);
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        transport: Transport.PROCIVIS,
      });
    });

    it('Proof request checks LVVC', async () => {
      const proofRequestId = await createProofRequest(
        authToken,
        proofSchemaLVVC,
        {
          transport: Transport.PROCIVIS,
        },
      );
      await requestProof(proofRequestId, authToken);

      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.status.value).toHaveText('Valid');
      await expect(CredentialDetailScreen.revocationMethod.value).toHaveText(
        'LVVC',
      );
    });

    it('Wallet proposes a validation update if necessary', async () => {
      await reloadApp();
    });

    it('Holder receives new validation', async () => {
      const proofRequestId = await createProofRequest(
        authToken,
        proofSchemaLVVC,
        {
          transport: Transport.PROCIVIS,
        },
      );
      await requestProof(proofRequestId, authToken);
      await expect(WalletScreen.screen).toBeVisible();

      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.status.value).toHaveText('Valid');
      await expect(CredentialDetailScreen.revocationMethod.value).toHaveText(
        'LVVC',
      );
    });

    it('Holder receives revocation', async () => {
      await revokeCredential(credentialId, authToken);
      // await reloadApp();
      const proofRequestId = await createProofRequest(
        authToken,
        proofSchemaLVVC,
        { transport: Transport.OPENID4VC },
      );
      const proofInvitationUrl = await requestProof(proofRequestId, authToken);

      await scanURL(proofInvitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
    });
  });
});
