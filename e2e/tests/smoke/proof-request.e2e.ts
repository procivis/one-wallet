/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import 'lodash.product';

import { expect } from 'detox';
import lodash from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import {
  ProofAction,
  proofSchemaCreate,
  proofSharing,
} from '../../helpers/proof-request';
import { Attributes } from '../../page-objects/components/NerdModeScreen';
import CredentialDetailScreen, {
  Action,
} from '../../page-objects/credential/CredentialDetailScreen';
import CredentialNerdScreen, {
  AttributeTestID,
} from '../../page-objects/credential/CredentialNerdScreen';
import ImagePreviewScreen from '../../page-objects/ImagePreviewScreen';
import ProofRequestSelectCredentialScreen from '../../page-objects/proof-request/ProofRequestSelectCredentialScreen';
import ProofRequestSharingScreen from '../../page-objects/proof-request/ProofRequestSharingScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { CredentialSchemaData } from '../../types/credentialSchema';
import { ProofSchemaResponseDTO } from '../../types/proof';
import { createCredentialSchema,keycloakAuth } from '../../utils/api';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
  URLOption,
  VerificationProtocol,
} from '../../utils/enums';
import { launchApp } from '../../utils/init';
import { shortUUID } from '../../utils/utils';

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
  describe('Proof request with valid credential', () => {
    beforeAll(async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Confirm proof request', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
        },
      });
    });

    it('Confirm proof request with universal link', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
          proofSharingUrlType: URLOption.UNIVERSAL_LINK,
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
          redirectUri: 'http://procivis.ch',
        },
      });
    });
  });

  // Pass
  describe('ONE-1182: Selective disclosure', () => {
    let jwtCredentialSchema: CredentialSchemaResponseDTO;
    let sdjwtCredentialSchema: CredentialSchemaResponseDTO;
    let jwtCredentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });

      const claims: CredentialSchemaData['claims'] = [
        {
          array: false,
          datatype: DataType.STRING,
          key: 'field1',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'field2',
          required: true,
        },
      ];
      jwtCredentialSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims,
          format: CredentialFormat.JWT,
          name: `jwt-selective-disclosure-${shortUUID()}`,
        }),
      );
      sdjwtCredentialSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims,
          format: CredentialFormat.SD_JWT,
          name: `sd jwt elective-disclosure-${shortUUID()}`,
        }),
      );

      proofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [jwtCredentialSchema, sdjwtCredentialSchema],
      });

      const jwtCredentialIds = await credentialIssuance({
        authToken: authToken,
        claimValues: [
          {
            claimId: jwtCredentialSchema.claims[0].id,
            path: jwtCredentialSchema.claims[0].key,
            value: 'value1',
          },
          {
            claimId: jwtCredentialSchema.claims[1].id,
            path: jwtCredentialSchema.claims[1].key,
            value: 'value2',
          },
        ],
        credentialSchema: jwtCredentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      jwtCredentialId = jwtCredentialIds.issuerCredentialId;
      await credentialIssuance({
        authToken: authToken,
        claimValues: [
          {
            claimId: sdjwtCredentialSchema.claims[0].id,
            path: sdjwtCredentialSchema.claims[0].key,
            value: 'value1',
          },
          {
            claimId: sdjwtCredentialSchema.claims[1].id,
            path: sdjwtCredentialSchema.claims[1].key,
            value: 'value2',
          },
        ],
        credentialSchema: sdjwtCredentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    }, 200000);

    it('displays selective disclosure notice and all claims', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
          selectiveDisclosureCredentials: [jwtCredentialId],
        },
      });
    });

    it('Selective disclosure notice. Multiple credentials', async () => {
      await credentialIssuance({
        authToken: authToken,
        claimValues: [
          {
            claimId: sdjwtCredentialSchema.claims[0].id,
            path: sdjwtCredentialSchema.claims[0].key,
            value: 'value1',
          },
          {
            claimId: sdjwtCredentialSchema.claims[1].id,
            path: sdjwtCredentialSchema.claims[1].key,
            value: 'value2',
          },
        ],
        credentialSchema: sdjwtCredentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      const selectiveDisclosureTest = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credential = ProofRequestSharingScreen.credentialAtIndex(1);
        await ProofRequestSharingScreen.scrollTo(credential.element);
        await credential.multipleCredentialsHeaderAvailable();
        await credential.verifyIsCardCollapsed();
        await credential.collapseOrExpand();
        await ProofRequestSharingScreen.scrollTo(
          credential.sceleton.notice.multiple.selectButton,
        );
        await credential.openMultipleCredentialsScreen();
        await expect(ProofRequestSelectCredentialScreen.screen).toBeVisible(1);

        await ProofRequestSelectCredentialScreen.scrollTo(
          ProofRequestSelectCredentialScreen.confirmButton,
        );
        await ProofRequestSelectCredentialScreen.confirmButton.tap();
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: selectiveDisclosureTest,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchema.id,
          selectiveDisclosureCredentials: [jwtCredentialId],
        },
      });
    });
  });

  // Pass
  describe('ONE-1233: Picture claim', () => {
    let pictureProofSchema: ProofSchemaResponseDTO;
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });

      const pictureCredentialSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              datatype: DataType.PICTURE,
              key: 'picture',
              required: true,
            },
          ],
          format: CredentialFormat.JSON_LD_CLASSIC,
          name: `Credential with picture ${uuidv4()}`,
        }),
      );
      pictureProofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [pictureCredentialSchema],
      });

      const issuerHolderCredentialIds = await credentialIssuance({
        authToken: authToken,
        credentialSchema: pictureCredentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      credentialId = issuerHolderCredentialIds.issuerCredentialId;
    });

    it('displays picture link on sharing screen', async () => {
      const proofSharingScreenTest = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credential = ProofRequestSharingScreen.credentialAtIndex(0);
        await credential.verifyAttributeValue(0, 'picture', undefined, true);
        await credential.attribute(0).image.tap();
        await expect(ImagePreviewScreen.screen).toBeVisible(1);
        await expect(ImagePreviewScreen.title).toHaveText('picture');
        await ImagePreviewScreen.closeButton.tap();
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: proofSharingScreenTest,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: pictureProofSchema.id,
          selectiveDisclosureCredentials: [credentialId],
        },
      });
    });
  });

  // Pass
  describe('Proof request Exchange Protocol TestCase', () => {
    beforeEach(async () => {
      await launchApp({ delete: true });
    });

    interface TestCombination {
      credentialFormat: CredentialFormat;
      issuanceExchange: IssuanceProtocol;
      proofExchange: VerificationProtocol;
    }

    const SUPPORTED = {
      credentialFormat: [CredentialFormat.JWT, CredentialFormat.SD_JWT],
      issuanceExchange: [IssuanceProtocol.OPENID4VCI_DRAFT13],
      proofExchange: [VerificationProtocol.OPENID4VP_DRAFT20],
    };

    const COMBINATIONS: TestCombination[] = lodash
      .product<any>(
        SUPPORTED.credentialFormat,
        SUPPORTED.issuanceExchange,
        SUPPORTED.proofExchange,
      )
      .map(([credentialFormat, issuanceExchange, proofExchange]) => ({
        credentialFormat,
        issuanceExchange,
        proofExchange,
      }));

    it.each(COMBINATIONS)(
      'Proof request: %o',
      async ({ credentialFormat, issuanceExchange, proofExchange }) => {
        const specificCredentialSchema = await createCredentialSchema(
          authToken,
          getCredentialSchemaData({ format: credentialFormat }),
        );
        await credentialIssuance({
          authToken: authToken,
          credentialSchema: specificCredentialSchema,
          exchange: issuanceExchange,
        });

        const specificProofSchema = await proofSchemaCreate(authToken, {
          credentialSchemas: [specificCredentialSchema],
        });

        await proofSharing(authToken, {
          data: {
            exchange: proofExchange,
            proofSchemaId: specificProofSchema.id,
          },
        });
      },
    );
  });

  // Pass
  describe('ONE-1316: Check validity of credential in proof request', () => {
    let proofSchemaLVVC: ProofSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });

      credentialSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.JWT,
          revocationMethod: RevocationMethod.LVVC,
        }),
      );
      proofSchemaLVVC = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchema],
        validityConstraint: 888,
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Proof request checks LVVC', async () => {
      await proofSharing(authToken, {
        data: {
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofSchemaLVVC.id,
        },
      });
      const credential = await WalletScreen.credentialAtIndex(0);
      await credential.openDetail();
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
      await expect(CredentialNerdScreen.screen).toBeVisible(1);

      const attributes: Attributes<AttributeTestID> = {
        [AttributeTestID.schemaName]: {
          label: 'Credential schema',
          value: credentialSchema.name,
        },
        [AttributeTestID.validity]: {
          label: 'Validity',
          value: 'Valid',
        },
        [AttributeTestID.revocationMethod]: {
          label: 'Revocation method',
          value: 'LVVC',
        },
      };
      await CredentialNerdScreen.verifyAttributes(attributes);
      await CredentialNerdScreen.back.tap();
      await expect(CredentialDetailScreen.historyEntryList.historyRow(0).element).toBeVisible();
      await expect(CredentialDetailScreen.historyEntryList.historyRow(0).label).toHaveText(
        'Request accepted',
      );
      await expect(CredentialDetailScreen.historyEntryList.historyRow(1).element).toBeVisible();
      await expect(CredentialDetailScreen.historyEntryList.historyRow(1).label).toHaveText(
        'Shared credential',
      );
    });
  });

  // FAIL
  describe('ONE-1579: Introduce credential schema type', () => {
    let swissPassport: CredentialSchemaResponseDTO;
    let driverLicenceSchema: CredentialSchemaResponseDTO;
    let usaPassport: CredentialSchemaResponseDTO;

    let proofSchemaMDL: ProofSchemaResponseDTO;
    let proofPassword2: ProofSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      driverLicenceSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          allowSuspension: true,
          claims: [
            {
              array: false,
              claims: [
                {
                  array: false,
                  datatype: DataType.STRING,
                  key: 'first_name',
                  required: true,
                },
                {
                  array: false,
                  datatype: DataType.STRING,
                  key: 'last_name',
                  required: true,
                },
                {
                  array: false,
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
          revocationMethod: RevocationMethod.MDOC_MSO_UPDATE_SUSPENSION,
        }),
      );

      swissPassport = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          allowSuspension: true,
          claims: [
            {
              array: false,
              datatype: DataType.STRING,
              key: 'first_name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'last_name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'id',
              required: true,
            },
            {
              array: false,
              datatype: DataType.BIRTH_DATE,
              key: 'birthday',
              required: true,
            },
          ],
          format: CredentialFormat.SD_JWT,
          name: `Swiss Passport-${uuidv4()}`,
          revocationMethod: RevocationMethod.LVVC,
        }),
      );

      usaPassport = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              datatype: DataType.STRING,
              key: 'first_name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'last_name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'id',
              required: true,
            },
            {
              array: false,
              datatype: DataType.BIRTH_DATE,
              key: 'birthday',
              required: true,
            },
          ],
          format: CredentialFormat.SD_JWT,
          name: `USA Passport-${uuidv4()}`,
          revocationMethod: RevocationMethod.STATUSLIST2021,
        }),
      );
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

      proofPassword2 = await proofSchemaCreate(authToken, {
        credentialSchemas: [swissPassport, usaPassport],
        name: `All in one ${uuidv4()}`,
        validityConstraint: 86000,
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: driverLicenceSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: [KeyType.ECDSA],
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await credentialIssuance({
        authToken: authToken,
        claimValues: [
          {
            claimId: swissPassport.claims[0].id,
            path: swissPassport.claims[0].key,
            value: 'Roger',
          },
          {
            claimId: swissPassport.claims[1].id,
            path: swissPassport.claims[1].key,
            value: 'Federer',
          },
          {
            claimId: swissPassport.claims[2].id,
            path: swissPassport.claims[2].key,
            value: '9874532',
          },
          {
            claimId: swissPassport.claims[3].id,
            path: swissPassport.claims[3].key,
            value: '1981-08-08T00:00:00.000Z',
          },
        ],
        credentialSchema: swissPassport,
        didFilter: {
          didMethods: DidMethod.KEY,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Verifier asks for first name of driving license', async () => {
      const testOnlyOneCredentialForSharing = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credential_0 = ProofRequestSharingScreen.credentialAtIndex(0);
        await credential_0.verifyIsVisible();
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: testOnlyOneCredentialForSharing,
          didMethod: DidMethod.MDL,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          keyAlgorithms: KeyType.ECDSA,
          proofSchemaId: proofSchemaMDL.id,
        },
      });

      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await expect(CredentialDetailScreen.historyEntryList.historyRow(0).label).toHaveText(
        'Request accepted',
      );
      await expect(CredentialDetailScreen.historyEntryList.historyRow(1).label).toHaveText(
        'Shared credential',
      );
    });

    it('ONE-1882: Scrolling Through Attributes During Proof Sharing', async () => {
      await credentialIssuance({
        authToken: authToken,
        claimValues: [
          {
            claimId: usaPassport.claims[0].id,
            path: usaPassport.claims[0].key,
            value: 'John',
          },
          {
            claimId: usaPassport.claims[1].id,
            path: usaPassport.claims[1].key,
            value: 'Arny',
          },
          {
            claimId: usaPassport.claims[2].id,
            path: usaPassport.claims[2].key,
            value: '123456789',
          },
          {
            claimId: usaPassport.claims[3].id,
            path: usaPassport.claims[3].key,
            value: '1990-01-01T00:00:00.000Z',
          },
        ],
        credentialSchema: usaPassport,
        didFilter: {
          didMethods: DidMethod.KEY,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      const testCredentials = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const swissCredential = ProofRequestSharingScreen.credentialAtIndex(0);
        await swissCredential.verifyIsVisible();
        await swissCredential.verifyIsCardCollapsed(false);
        const attributes_1 = [
          { index: 0, key: 'first_name', value: 'Roger' },
          { index: 1, key: 'last_name', value: 'Federer' },
          { index: 2, key: 'id', value: '9874532' },
          { index: 3, key: 'birthday', value: '8/8/1981' },
        ];
        await swissCredential.verifyAttributeValues(
          attributes_1,
          ProofRequestSharingScreen.scrollTo,
        );

        const usaCredential = ProofRequestSharingScreen.credentialAtIndex(1);
        await ProofRequestSharingScreen.scrollTo(usaCredential.element);
        await usaCredential.verifyIsVisible();
        await usaCredential.verifyIsCardCollapsed();
        await usaCredential.collapseOrExpand();

        const attributes_2 = [
          { index: 0, key: 'first_name', value: 'John' },
          { index: 1, key: 'last_name', value: 'Arny' },
          { index: 2, key: 'id', value: '123456789' },
          { index: 3, key: 'birthday', value: '1/1/1990' },
        ];
        await usaCredential.verifyAttributeValues(
          attributes_2,
          ProofRequestSharingScreen.scrollTo,
        );
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: testCredentials,
          didMethod: DidMethod.KEY,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: proofPassword2.id,
        },
      });
    });
  });
});
