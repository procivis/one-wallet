/* eslint-disable jest/no-disabled-tests */
import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { credentialIssuance } from '../helpers/credential';
import {
  ProofAction,
  proofSchemaCreate,
  proofSharing,
} from '../helpers/proof-request';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
// import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import ImagePreviewScreen from '../page-objects/ImagePreviewScreen';
import ProofRequestAcceptProcessScreen from '../page-objects/proof-request/ProofRequestAcceptProcessScreen';
import ProofRequestSharingScreen from '../page-objects/proof-request/ProofRequestSharingScreen';
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
  offerCredential,
  requestProof,
  revokeCredential,
} from '../utils/bff-api';
import { verifyButtonEnabled } from '../utils/button';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  Exchange,
  KeyType,
  RevocationMethod,
} from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-614: Proof request', () => {
  let authToken: string;
  let credentialSchema: CredentialSchemaResponseDTO;
  let proofSchema: ProofSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();
    authToken = await bffLogin();
    credentialSchema = await createCredentialSchema(authToken, {
      format: CredentialFormat.SDJWT,
      revocationMethod: RevocationMethod.STATUSLIST2021,
    });
    proofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [credentialSchema],
    });
  });

  // Pass
  describe('Proof request with valid credential', () => {
    beforeAll(async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        exchange: Exchange.OPENID4VC,
      });
    });

    it('Confirm proof request', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: Exchange.OPENID4VC,
          proofSchemaId: proofSchema.id,
        },
      });
    });

    it('Confirm proof request with redirect URI', async () => {
      await proofSharing(authToken, {
        data: {
          proofSchemaId: proofSchema.id,
          redirectUri: 'https://procivis.ch',
        },
      });
    });

    it('Reject proof request', async () => {
      await proofSharing(authToken, {
        action: ProofAction.REJECT,
        data: {
          proofSchemaId: proofSchema.id,
          redirectUri: 'https://procivis.ch',
        },
      });
    });
  });

  describe('ONE-1182: Selective disclosure', () => {
    let jwtCredentialSchema: CredentialSchemaResponseDTO;
    let sdjwtCredentialSchema: CredentialSchemaResponseDTO;
    let jwtCredentialId: string;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    let sdJwtCredentialId: string;

    beforeAll(async () => {
      // await launchApp({ delete: true });

      const claims: CredentialSchemaData['claims'] = [
        { datatype: DataType.STRING, key: 'field1', required: true },
        { datatype: DataType.STRING, key: 'field2', required: true },
      ];
      jwtCredentialSchema = await createCredentialSchema(authToken, {
        claims,
        format: CredentialFormat.JWT,
        name: `jwt-selective-disclosure-${uuidv4()}`,
      });
      sdjwtCredentialSchema = await createCredentialSchema(authToken, {
        claims,
        format: CredentialFormat.SDJWT,
        name: `sd jwt elective-disclosure-${uuidv4()}`,
      });

      proofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [jwtCredentialSchema, sdjwtCredentialSchema],
      });

      jwtCredentialId = await credentialIssuance({
        authToken: authToken,
        claimValues: [
          { claimId: jwtCredentialSchema.claims[0].id, value: 'value1' },
          { claimId: jwtCredentialSchema.claims[1].id, value: 'value2' },
        ],
        credentialSchema: jwtCredentialSchema,
        exchange: Exchange.PROCIVIS,
      });

      sdJwtCredentialId = await credentialIssuance({
        authToken: authToken,
        claimValues: [
          { claimId: sdjwtCredentialSchema.claims[0].id, value: 'value1' },
          { claimId: sdjwtCredentialSchema.claims[1].id, value: 'value2' },
        ],
        credentialSchema: sdjwtCredentialSchema,
        exchange: Exchange.PROCIVIS,
      });
    });

    it('displays selective disclosure notice and all claims', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: Exchange.PROCIVIS,
          proofSchemaId: proofSchema.id,
          selectiveDisclosureCredentials: [jwtCredentialId],
        },
      });
      // await expect(
      //   ProofRequestSharingScreen.credential(0).notice.selectiveDisclosure,
      // ).toBeVisible();

      // await expect(element(by.text('field1'))).toBeVisible();
      // await expect(element(by.text('value1'))).toBeVisible();
      // await expect(element(by.text('field2'))).toBeVisible();
      // await expect(element(by.text('value2'))).toBeVisible();

      // await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);
    });

    it('displays selective disclosure notice on affected options', async () => {
      credentialIssuance({
        authToken: authToken,
        claimValues: [
          { claimId: sdjwtCredentialSchema.claims[0].id, value: 'value1' },
          { claimId: sdjwtCredentialSchema.claims[1].id, value: 'value2' },
        ],
        credentialSchema: sdjwtCredentialSchema,
      });
      const selectiveDisclosureTest = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible();
        const credential = ProofRequestSharingScreen.credential(1);
        await ProofRequestSharingScreen.scrollTo(credential.element);
        await credential.multipleCredentialsAvailable();
        await credential.collapseOrExpand();
        await expect(credential.card.notice.multiple.element).toBeVisible();
        await credential.card.notice.multiple.selectButton.tap();
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: selectiveDisclosureTest,
          exchange: Exchange.OPENID4VC,
          proofSchemaId: proofSchema.id,
          selectiveDisclosureCredentials: [jwtCredentialId],
        },
      });

      // await ProofRequestSharingScreen.credential(
      //   0,
      // ).notice.multiple.selectButton.tap();

      // await expect(ProofRequestSelectCredentialScreen.screen).toBeVisible();
      // await expect(
      //   ProofRequestSelectCredentialScreen.credential(jwtCredentialId).element,
      // ).toBeVisible();
      // await expect(
      //   ProofRequestSelectCredentialScreen.credential(jwtCredentialId).notice
      //     .selectiveDisclosure,
      // ).toBeVisible();

      // await expect(
      //   ProofRequestSelectCredentialScreen.credential(sdjwtCredentialId)
      //     .element,
      // ).toBeVisible();
      // await expect(
      //   ProofRequestSelectCredentialScreen.credential(sdjwtCredentialId).notice
      //     .selectiveDisclosure,
      // ).not.toExist();
    });
  });

  // Fail
  describe.skip('Proof request without credentials', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
    });

    it('Without credentials', async () => {
      // const proofRequestId = await proofSchemaCreate(authToken, {});
      // const invitationUrl = await requestProof(proofRequestId, authToken);
      // await scanURL(invitationUrl);
      // await expect(ProofRequestSharingScreen.screen).toBeVisible();
      // await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);
    });
  });

  // Fail
  describe.skip('ONE-620: Revoked credentials', () => {
    const credentialIds: string[] = [];
    beforeAll(async () => {
      await launchApp({ delete: true });

      for (let i = 0; i < 3; i++) {
        const credentialId = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchema,
          exchange: Exchange.OPENID4VC,
        });
        credentialIds.push(credentialId);
      }
    });

    it('2 valid one revoked', async () => {
      await revokeCredential(credentialIds[2], authToken);
      const proofRequestId = await createProofRequest(authToken, {
        proofSchemaId: proofSchema.id,
      });
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      // await expect(
      //   ProofRequestSharingScreen.credential(0).title(credentialIds[1]),
      // ).toExist();
      // await expect(
      //   ProofRequestSharingScreen.credential(0).notice.multiple.element,
      // ).toBeVisible();
      // await ProofRequestSharingScreen.credential(
      //   0,
      // ).notice.multiple.selectButton.tap();

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
      const proofRequestId = await createProofRequest(authToken, {
        proofSchemaId: proofSchema.id,
      });
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, true);

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      // no selection possible
      // await expect(
      //   ProofRequestSharingScreen.credential(0).notice.multiple.element,
      // ).not.toExist();
      // await expect(
      //   ProofRequestSharingScreen.credential(0).title(credentialIds[0]),
      // ).toExist();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('all revoked', async () => {
      await revokeCredential(credentialIds[0], authToken);
      const proofRequestId = await createProofRequest(authToken, {
        proofSchemaId: proofSchema.id,
      });
      const invitationUrl = await requestProof(proofRequestId, authToken);
      await scanURL(invitationUrl);

      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);

      await expect(
        ProofRequestSharingScreen.credential(0).element,
      ).toBeVisible();
      await ProofRequestSharingScreen.credential(0).verifyStatus('revoked');
      // await expect(
      //   ProofRequestSharingScreen.credential(0).notice.revoked,
      // ).toExist();
      await ProofRequestSharingScreen.cancelButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });

  // Fail
  describe.skip('ONE-1233: Picture claim', () => {
    const pictureKey = 'picture';
    let credentialId: string;
    let pictureProofSchema: Record<string, any>;

    beforeAll(async () => {
      await launchApp({ delete: true });

      const pictureCredentialSchema = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.PICTURE, key: pictureKey, required: true },
        ],
      });
      pictureProofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [pictureCredentialSchema],
      });

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
      const pictureClaim = credential.attribute(pictureKey);
      await expect(pictureClaim.element).toBeVisible();
      await expect(pictureClaim.title).toHaveText(pictureKey);
      await pictureClaim.value.tap();
      await expect(ImagePreviewScreen.screen).toBeVisible();
      await expect(ImagePreviewScreen.title).toHaveText(pictureKey);
    });
  });

  // Fail
  describe.skip('Proof request Exchange Protocol TestCase', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
    });

    interface TestCombination {
      credentialFormat: CredentialFormat;
      issuanceExchange: Exchange;
      proofExchange: Exchange;
    }

    const SUPPORTED = {
      credentialFormat: [CredentialFormat.JWT, CredentialFormat.SDJWT],
      issuanceExchange: [Exchange.PROCIVIS, Exchange.OPENID4VC],
      proofExchange: [Exchange.PROCIVIS, Exchange.OPENID4VC],
    };

    const COMBINATIONS = SUPPORTED.credentialFormat.flatMap(
      (credentialFormat) =>
        SUPPORTED.issuanceExchange.flatMap((issuanceExchange) =>
          SUPPORTED.proofExchange.flatMap<TestCombination>((proofExchange) => ({
            credentialFormat,
            issuanceExchange,
            proofExchange,
          })),
        ),
    );

    it.each(COMBINATIONS)(
      'Proof request: %o',
      async ({ credentialFormat, issuanceExchange, proofExchange }) => {
        const specificCredentialSchema = await createCredentialSchema(
          authToken,
          { format: credentialFormat },
        );

        await credentialIssuance({
          authToken: authToken,
          credentialSchema: specificCredentialSchema,
          exchange: issuanceExchange,
        });

        const specificProofSchema = await proofSchemaCreate(authToken, {
          credentialSchemas: [specificCredentialSchema],
        });
        const proofRequestId = await createProofRequest(authToken, {
          exchange: proofExchange,
          proofSchemaId: specificProofSchema.id,
        });
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

  // Fail
  describe.skip('ONE-1316: Check validity of credential in proof request', () => {
    let proofSchemaLVVC: ProofSchemaResponseDTO;
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });

      credentialSchema = await createCredentialSchema(authToken, {
        revocationMethod: RevocationMethod.LVVC,
      });
      proofSchemaLVVC = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchema],
      });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        exchange: Exchange.PROCIVIS,
      });
    });

    it('Proof request checks LVVC', async () => {
      const proofRequestId = await createProofRequest(authToken, {
        exchange: Exchange.PROCIVIS,
        proofSchemaId: proofSchemaLVVC.id,
      });
      await requestProof(proofRequestId, authToken);

      await WalletScreen.credential(credentialId).header.element.tap();
      // await expect(CredentialDetailScreen.status.value).toHaveText('Valid');
      // await expect(CredentialDetailScreen.revocationMethod.value).toHaveText(
      //   'LVVC',
      // );
    });

    it('Wallet proposes a validation update if necessary', async () => {
      await reloadApp();
    });

    it('Holder receives new validation', async () => {
      const proofRequestId = await createProofRequest(authToken, {
        exchange: Exchange.PROCIVIS,
        proofSchemaId: proofSchemaLVVC.id,
      });
      await requestProof(proofRequestId, authToken);
      await expect(WalletScreen.screen).toBeVisible();

      await WalletScreen.credential(credentialId).header.element.tap();
      // await expect(CredentialDetailScreen.status.value).toHaveText('Valid');
      // await expect(CredentialDetailScreen.revocationMethod.value).toHaveText(
      // 'LVVC',
      // );
    });

    it('Holder receives revocation', async () => {
      await revokeCredential(credentialId, authToken);
      // await reloadApp();
      const proofRequestId = await createProofRequest(authToken, {
        exchange: Exchange.OPENID4VC,
        proofSchemaId: proofSchemaLVVC.id,
      });
      const proofInvitationUrl = await requestProof(proofRequestId, authToken);

      await scanURL(proofInvitationUrl);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
    });
  });

  // Pass
  describe('ONE-1579: Introduce credential schema type', () => {
    let passportSchema: CredentialSchemaResponseDTO;
    let driverLicenceSchema: CredentialSchemaResponseDTO;
    let proofSchemaMDL: ProofSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      driverLicenceSchema = await createCredentialSchema(authToken, {
        claims: [
          {
            claims: [
              { datatype: DataType.STRING, key: 'first_name', required: true },
              { datatype: DataType.STRING, key: 'last_name', required: true },
              {
                datatype: DataType.STRING,
                key: 'license_number',
                required: true,
              },
            ],
            datatype: DataType.OBJECT,
            key: 'User data',
            required: true,
          },
        ],
        format: CredentialFormat.MDOC,
        name: `Driver Licence-${uuidv4()}`,
        revocationMethod: RevocationMethod.NONE,
        schemaId: `org.iso.18013.5.1.mDL-${uuidv4()}`,
      });

      passportSchema = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first_name', required: true },
          { datatype: DataType.STRING, key: 'last_name', required: true },
          { datatype: DataType.STRING, key: 'id', required: true },
          { datatype: DataType.BIRTH_DATE, key: 'birthday', required: true },
        ],
        format: CredentialFormat.SDJWT,
        name: `Swiss Passport-${uuidv4()}`,
        revocationMethod: RevocationMethod.LVVC,
      });

      proofSchemaMDL = await proofSchemaCreate(authToken, {
        credentialSchemas: [driverLicenceSchema],
        name: `MDL first name ${uuidv4()}`,
        proofInputSchemas: [
          {
            claimSchemas: [
              {
                id: driverLicenceSchema.claims[0].claims![0].id,
                required: true,
              },
            ],
            credentialSchemaId: driverLicenceSchema.id,
            validityConstraint: 86000,
          },
        ],
      });

      await credentialIssuance({
        authToken: authToken,
        credentialSchema: driverLicenceSchema,
        didMethod: DidMethod.MDL,
        exchange: Exchange.OPENID4VC,
        keyAlgorithms: [KeyType.ES256],
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: passportSchema,
        didMethod: DidMethod.KEY,
        exchange: Exchange.OPENID4VC,
      });
    });

    it('Verifier asks for first name of driving license', async () => {
      const testOnlyOneCredentialForSharing = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible();
        const credential_1 = ProofRequestSharingScreen.credential(0);
        await credential_1.verifyIsVisible();
        const credential_2 = ProofRequestSharingScreen.credential(1);
        await credential_2.verifyIsVisible(false);
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: testOnlyOneCredentialForSharing,
          didMethod: DidMethod.MDL,
          exchange: Exchange.OPENID4VC,
          keyAlgorithms: KeyType.ES256,
          proofSchemaId: proofSchemaMDL.id,
        },
      });

      await WalletScreen.openDetailScreen(driverLicenceSchema.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(CredentialDetailScreen.history(0).label).toHaveText(
        'Shared credential',
      );
    });
  });
});
