import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { credentialIssuance } from '../helpers/credential';
import { getCredentialSchemaData } from '../helpers/credentialSchemas';
import { proofSchemaCreate, proofSharing } from '../helpers/proof-request';
import ProofRequestSharingScreen from '../page-objects/proof-request/ProofRequestSharingScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { ProofSchemaResponseDTO } from '../types/proof';
import { createCredentialSchema,keycloakAuth } from '../utils/api';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
  VerificationProtocol,
} from '../utils/enums';
import { launchApp } from '../utils/init';

// Broken testIds for nested claims
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('ONE-614: Proof request', () => {
  let authToken: string;
  let mdocSchema: CredentialSchemaResponseDTO;
  let singleClaimMdocProofSchema: ProofSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();

    mdocSchema = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        claims: [
          {
            array: false,
            claims: [
              {
                array: false,
                datatype: DataType.STRING,
                key: 'country',
                required: true,
              },
              {
                array: false,
                datatype: DataType.STRING,
                key: 'region',
                required: true,
              },
              {
                array: false,
                datatype: DataType.STRING,
                key: 'city',
                required: true,
              },
              {
                array: false,
                datatype: DataType.STRING,
                key: 'street',
                required: true,
              },
            ],
            datatype: DataType.OBJECT,
            key: 'Address',
            required: true,
          },
          {
            array: false,
            claims: [
              {
                array: false,
                datatype: DataType.STRING,
                key: 'first name',
                required: true,
              },
              {
                array: false,
                datatype: DataType.STRING,
                key: 'last name',
                required: true,
              },
              {
                array: false,
                datatype: DataType.MDL_PICTURE,
                key: 'portrait',
                required: true,
              },
              {
                array: false,
                datatype: DataType.BIRTH_DATE,
                key: 'birthdate',
                required: true,
              },
            ],
            datatype: DataType.OBJECT,
            key: 'Credentials',
            required: true,
          },
        ],
        format: CredentialFormat.MDOC,
        revocationMethod: RevocationMethod.NONE,
      }),
    );
    singleClaimMdocProofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true }, // country
            { id: mdocSchema.claims[1].claims![0].id, required: true }, // first name
            { id: mdocSchema.claims[1].claims![2].id, required: true }, // portrait
          ],
          credentialSchemaId: mdocSchema.id,
        },
      ],
    });
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: mdocSchema,
      didFilter: {
        didMethods: DidMethod.MDL,
        keyAlgorithms: KeyType.ECDSA,
      },
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
  });

  it('mDoc credential. Single credential with nested claims', async () => {
    const mdocCredentialTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      const credentialCard = ProofRequestSharingScreen.credentialAtIndex(0);
      await credentialCard.verifyIsVisible();
      await credentialCard.verifyCredentialName(mdocSchema.name);
      const attributes = [
        { index: '0', key: 'Address' },
        { index: '0.1', key: 'country', value: 'string' },
        { index: '1.1', key: 'first name', value: 'string' },
        { image: true, index: '1.2', key: 'portrait' },
      ];
      await credentialCard.verifyAttributeValues(
        attributes,
        ProofRequestSharingScreen.scrollTo,
      );
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialTest,
        exchange: VerificationProtocol.OPENID4VP_DRAFT20,
        proofSchemaId: singleClaimMdocProofSchema.id,
      },
    });
  });

  it('[ONE-3419] mDoc with JWT', async () => {
    const diplomaJwtSchema = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        claims: [
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Faculty',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Department',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Education',
            required: true,
          },
        ],
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.LVVC,
      }),
    );
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: diplomaJwtSchema,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    const jwtProofSchemaWithMdoc = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema, diplomaJwtSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![2].id, required: true },
          ],
          credentialSchemaId: mdocSchema.id,
        },
        {
          claimSchemas: [
            { id: diplomaJwtSchema.claims[0].id, required: true },
            { id: diplomaJwtSchema.claims[1].id, required: true },
            { id: diplomaJwtSchema.claims[2].id, required: true },
          ],
          credentialSchemaId: diplomaJwtSchema.id,
          validityConstraint: 86400,
        },
      ],
    });

    const mdocCredentialSharingTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      const credentialCard_1 = ProofRequestSharingScreen.credential(0);
      await credentialCard_1.verifyIsVisible();
      await credentialCard_1.verifyCredentialName(mdocSchema.name);
      await credentialCard_1.verifyIsCardCollapsed(false);
      await credentialCard_1.collapseOrExpand();

      const credentialCard_2 = ProofRequestSharingScreen.credential(1);
      await ProofRequestSharingScreen.scrollTo(credentialCard_2.element);
      await credentialCard_2.verifyIsVisible();
      await credentialCard_2.verifyCredentialName(diplomaJwtSchema.name);
      await credentialCard_2.verifyIsCardCollapsed(true);
      await credentialCard_2.selectiveDisclosureMessageVisible();
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialSharingTest,
        exchange: VerificationProtocol.OPENID4VP_DRAFT20,
        proofSchemaId: jwtProofSchemaWithMdoc.id,
      },
    });
  });

  it('[ONE-3419] mDoc with SD_JWT', async () => {
    const diplomaSdjwtSchema = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        claims: [
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Faculty',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Department',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Education',
            required: true,
          },
        ],
        format: CredentialFormat.SD_JWT,
        revocationMethod: RevocationMethod.LVVC,
      }),
    );
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: diplomaSdjwtSchema,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    const sdjwtProofSchemaWithMdoc = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema, diplomaSdjwtSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![2].id, required: true },
          ],
          credentialSchemaId: mdocSchema.id,
        },
        {
          claimSchemas: [
            { id: diplomaSdjwtSchema.claims[0].id, required: true },
            { id: diplomaSdjwtSchema.claims[1].id, required: true },
            { id: diplomaSdjwtSchema.claims[2].id, required: true },
          ],
          credentialSchemaId: diplomaSdjwtSchema.id,
          validityConstraint: 86400,
        },
      ],
    });

    const mdocCredentialSharingTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      const credentialCard_1 = ProofRequestSharingScreen.credential(0);
      await credentialCard_1.verifyIsVisible();
      await credentialCard_1.verifyCredentialName(mdocSchema.name);
      await credentialCard_1.verifyIsCardCollapsed(false);
      await credentialCard_1.collapseOrExpand();

      const credentialCard_2 = ProofRequestSharingScreen.credential(1);
      await ProofRequestSharingScreen.scrollTo(credentialCard_2.element);
      await credentialCard_2.verifyIsVisible();
      await credentialCard_2.verifyCredentialName(diplomaSdjwtSchema.name);
      await credentialCard_2.verifyIsCardCollapsed(true);
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialSharingTest,
        exchange: VerificationProtocol.OPENID4VP_DRAFT20,
        proofSchemaId: sdjwtProofSchemaWithMdoc.id,
      },
    });
  });

  it('[ONE-3419] mDoc with JSON-LD BBS+', async () => {
    const diplomaBBSSchema = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        claims: [
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Faculty',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Department',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Education',
            required: true,
          },
        ],
        format: CredentialFormat.JSON_LD_BBSPLUS,
        revocationMethod: RevocationMethod.LVVC,
      }),
    );
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: diplomaBBSSchema,
      didFilter: {
        keyAlgorithms: KeyType.BBS_PLUS,
      },
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    const bbsProofSchemaWithMdoc = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema, diplomaBBSSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![2].id, required: true },
          ],
          credentialSchemaId: mdocSchema.id,
        },
        {
          claimSchemas: [
            { id: diplomaBBSSchema.claims[0].id, required: true },
            { id: diplomaBBSSchema.claims[1].id, required: true },
            { id: diplomaBBSSchema.claims[2].id, required: true },
          ],
          credentialSchemaId: diplomaBBSSchema.id,
          validityConstraint: 86400,
        },
      ],
    });

    const mdocCredentialSharingTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      const credentialCard_1 = ProofRequestSharingScreen.credential(0);
      await credentialCard_1.verifyIsVisible();
      await credentialCard_1.verifyCredentialName(mdocSchema.name);
      await credentialCard_1.verifyIsCardCollapsed(false);
      await credentialCard_1.collapseOrExpand();

      const credentialCard_2 = ProofRequestSharingScreen.credential(1);
      await ProofRequestSharingScreen.scrollTo(credentialCard_2.element);
      await credentialCard_2.verifyIsVisible();
      await credentialCard_2.verifyCredentialName(diplomaBBSSchema.name);
      await credentialCard_2.verifyIsCardCollapsed(true);
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialSharingTest,
        exchange: VerificationProtocol.OPENID4VP_DRAFT20,
        proofSchemaId: bbsProofSchemaWithMdoc.id,
      },
    });
  });

  it('[ONE-3419] mDoc with JSON-LD', async () => {
    const diplomajsonLDSchema = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        claims: [
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Faculty',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Department',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Education',
            required: true,
          },
        ],
        format: CredentialFormat.JSON_LD_CLASSIC,
        name: `University Diploma ${uuidv4()}`,
        revocationMethod: RevocationMethod.LVVC,
      }),
    );
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: diplomajsonLDSchema,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    const jsonLDProofSchemaWithMdoc = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema, diplomajsonLDSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![2].id, required: true },
          ],
          credentialSchemaId: mdocSchema.id,
        },
        {
          claimSchemas: [
            { id: diplomajsonLDSchema.claims[0].id, required: true },
            { id: diplomajsonLDSchema.claims[1].id, required: true },
            { id: diplomajsonLDSchema.claims[2].id, required: true },
          ],
          credentialSchemaId: diplomajsonLDSchema.id,
          validityConstraint: 86400,
        },
      ],
    });

    const mdocCredentialSharingTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
      const credentialCard_1 = ProofRequestSharingScreen.credential(0);
      await credentialCard_1.verifyIsVisible();
      await credentialCard_1.verifyCredentialName(mdocSchema.name);
      await credentialCard_1.verifyIsCardCollapsed(false);
      await credentialCard_1.collapseOrExpand();

      const credentialCard_2 = ProofRequestSharingScreen.credential(1);
      await ProofRequestSharingScreen.scrollTo(credentialCard_2.element);
      await credentialCard_2.verifyIsVisible();
      await credentialCard_2.verifyCredentialName(diplomajsonLDSchema.name);
      await credentialCard_2.verifyIsCardCollapsed(true);
      await credentialCard_2.selectiveDisclosureMessageVisible();
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialSharingTest,
        exchange: VerificationProtocol.OPENID4VP_DRAFT20,
        proofSchemaId: jsonLDProofSchemaWithMdoc.id,
      },
    });
  });

  describe('ONE-2227: Verify mdoc array credentials', () => {
    let driverLicenceSchema: CredentialSchemaResponseDTO;
    let driverLicenceProofSchema: ProofSchemaResponseDTO;

    beforeAll(async () => {
      driverLicenceSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              claims: [
                {
                  array: false,
                  claims: [],
                  datatype: DataType.STRING,
                  key: 'Full Name',
                  required: true,
                },
                {
                  array: true,
                  claims: [
                    {
                      array: false,
                      claims: [],
                      datatype: DataType.STRING,
                      key: 'Category Name',
                      required: true,
                    },
                    {
                      array: false,
                      claims: [],
                      datatype: DataType.DATE,
                      key: 'Issue Date',
                      required: true,
                    },
                    {
                      array: false,
                      claims: [],
                      datatype: DataType.DATE,
                      key: 'Expiry Date',
                      required: true,
                    },
                  ],
                  datatype: DataType.OBJECT,
                  key: 'Category',
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
        }),
      );

      driverLicenceProofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [driverLicenceSchema],
        proofInputSchemas: [
          {
            claimSchemas: [
              {
                id: driverLicenceSchema.claims[0].claims![0].id,
                required: true,
              }, // Full Name
              {
                id: driverLicenceSchema.claims[0].claims![1].id,
                required: true,
              }, // Category
            ],
            credentialSchemaId: driverLicenceSchema.id,
          },
        ],
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: driverLicenceSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ECDSA,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Verify Single credential with array claims', async () => {
      const mdocCredentialTest = async () => {
        await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
        const credentialCard = ProofRequestSharingScreen.credential(0);
        await credentialCard.verifyIsVisible();
        await credentialCard.verifyCredentialName(driverLicenceSchema.name);
        const claims = [
          { key: 'Full Name', value: 'string' },
          {
            array: true,
            key: 'Category',
            values: [
              {
                key: 'Category Name',
                value: 'string',
              },
              {
                key: 'Issue Date',
                value: '8/21/2023',
              },
              {
                key: 'Expiry Date',
                value: '8/21/2023',
              },
            ],
          },
        ];
        await credentialCard.verifyClaimValues(
          claims,
          ProofRequestSharingScreen.scrollTo,
        );
      };

      await proofSharing(authToken, {
        data: {
          customShareDataScreenTest: mdocCredentialTest,
          exchange: VerificationProtocol.OPENID4VP_DRAFT20,
          proofSchemaId: driverLicenceProofSchema.id,
        },
      });
    });
  });
});
