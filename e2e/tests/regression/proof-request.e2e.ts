 
/* eslint-disable jest/no-disabled-tests */
import 'lodash.product';

import { expect } from 'detox';

import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import {
  ProofAction,
  proofSchemaCreate,
  proofSharing,
} from '../../helpers/proof-request';
import { CredentialStatus } from '../../page-objects/components/CredentialCard';
import { LoaderViewState } from '../../page-objects/components/LoadingResult';
import ProofRequestSelectCredentialScreen from '../../page-objects/proof-request/ProofRequestSelectCredentialScreen';
import ProofRequestSharingScreen from '../../page-objects/proof-request/ProofRequestSharingScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { ProofSchemaResponseDTO } from '../../types/proof';
import {
  keycloakAuth,
  createCredentialSchema,
  createProofRequest,
  deleteProofRequest,
  requestProof,
  revokeCredential,
} from '../../utils/api';
import { verifyButtonEnabled } from '../../utils/button';
import {
  CredentialFormat,
  IssuanceProtocol,
  RevocationMethod,
  VerificationProtocol,
} from '../../utils/enums';
import { launchApp, reloadApp } from '../../utils/init';
import { scanURL } from '../../utils/scan';

describe('ONE-614: Proof request', () => {
  let authToken: string;
  let credentialSchema: CredentialSchemaResponseDTO;
  let proofSchema: ProofSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();
    credentialSchema = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        allowSuspension: true,
        format: CredentialFormat.SD_JWT,
        revocationMethod: RevocationMethod.LVVC,
      }),
    );
    proofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [credentialSchema],
      validityConstraint: 888,
    });
  });

  // Pass
  describe('Proof request without credentials', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
    });

    it('Without credentials', async () => {
      const proofSharingWithoutCredentials = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credentialCard = ProofRequestSharingScreen.credentialAtIndex(0);
        await credentialCard.verifyIsVisible();
        await credentialCard.verifyStatus(CredentialStatus.MISSING);
        await credentialCard.verifyCredentialName(credentialSchema.name);
        await credentialCard.verifyIsCardCollapsed(false);
        await credentialCard.verifyAttributeValue(
          '0',
          'Full name',
          'Attribute missing',
        );
      };

      await proofSharing(authToken, {
        action: ProofAction.SHARE_BLOCKED,
        data: {
          customShareDataScreenTest: proofSharingWithoutCredentials,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
      });
    });
  });

  // Fail. Credential status does not update
  describe.skip('ONE-620: Revoked credentials', () => {
    const credentialIds: string[] = [];

    beforeAll(async () => {
      await launchApp({ delete: true });
      for (let i = 0; i < 3; i++) {
        const issuerHolderCredentialIds = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchema,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        });
        credentialIds.push(issuerHolderCredentialIds.issuerCredentialId);
      }
    });

    it('Revoked credential', async () => {
      await revokeCredential(credentialIds[0], authToken);
      await reloadApp({
        credentialUpdate: [
          {
            expectedLabel: 'Revoked',
            index: 0,
            status: CredentialStatus.REVOKED,
          },
        ],
      });
      const proofSharingRevokation = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credentialCard_1 = ProofRequestSharingScreen.credentialAtIndex(0);
        await credentialCard_1.verifyIsVisible();
        await credentialCard_1.verifyStatus(CredentialStatus.REVOKED);
        await expect(credentialCard_1.sceleton.notice.revoked).toBeVisible();
      };

      await proofSharing(authToken, {
        action: ProofAction.SHARE_BLOCKED,
        data: {
          customShareDataScreenTest: proofSharingRevokation,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
      });
    });

    it('2 valid one revoked', async () => {
      await revokeCredential(credentialIds[1], authToken);
      await reloadApp();
      const proofSharingRevokation = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credentialCard_0 = ProofRequestSharingScreen.credentialAtIndex(0);
        await credentialCard_0.verifyIsVisible();
        await credentialCard_0.verifyStatus(CredentialStatus.REVOKED);
        await expect(credentialCard_0.sceleton.notice.revoked).toBeVisible();

        const credentialCard_1 = ProofRequestSharingScreen.credentialAtIndex(1);
        await credentialCard_1.verifyIsVisible();
        await credentialCard_1.verifyStatus(CredentialStatus.REVOKED);
      };

      await proofSharing(authToken, {
        action: ProofAction.SHARE_BLOCKED,
        data: {
          customShareDataScreenTest: proofSharingRevokation,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
      });

      await expect(ProofRequestSelectCredentialScreen.screen).toBeVisible(1);
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
      await expect(WalletScreen.screen).toBeVisible(1);
    });

    it.skip('2 revoked one valid', async () => {
      await revokeCredential(credentialIds[1], authToken);
      const proofRequestId = await createProofRequest(authToken, {
        proofSchemaId: proofSchema.id,
      });
      const invitationUrls = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrls.url);

      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible(1);
    });

    it.skip('all revoked', async () => {
      await revokeCredential(credentialIds[0], authToken);
      const proofRequestId = await createProofRequest(authToken, {
        proofSchemaId: proofSchema.id,
      });
      const invitationUrls = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrls.url);

      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible(1);
    });
  });

  describe('ONE-4590: Delete proof request', () => {
    beforeAll(async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Scan proof with deleted proof request before scanning QR code', async () => {
      const beforeQRCodeScanning = async (proofRequestId: string) => {
        await deleteProofRequest(authToken, proofRequestId);
      };

      await proofSharing(authToken, {
        data: {
          beforeQRCodeScanning,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
        expectConnectionError: true,
        expectedResult: LoaderViewState.Warning,
      });
    });

    it('Scan proof with deleted proof request on the review screen', async () => {
      const customShareDataScreenTest = async (proofRequestId: string) => {
        await deleteProofRequest(authToken, proofRequestId);
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
        expectedResult: LoaderViewState.Warning,
      });
    });
  });
});
