import { expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import {
  getCredentialSchemaData,
} from '../helpers/credentialSchemas';
import CredentialDetailScreen from '../page-objects/credential/CredentialDetailScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  keycloakAuth,
  createCredentialSchema,
} from '../utils/api';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
} from '../utils/enums';
import { launchApp } from '../utils/init';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();
  });

  describe('ONE-2054: Issue mdoc credentials', () => {
    let mdocSchema: CredentialSchemaResponseDTO;

    beforeAll(async () => {
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
          ],
          format: CredentialFormat.MDOC,
          revocationMethod: RevocationMethod.MDOC_MSO_UPDATE_SUSPENSION,
        }),
      );
    });

    it('Issue mdoc credential', async () => {
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
  });

  describe('ONE-2227: Issue mdoc array credentials', () => {
    let driverLicenceSchema: CredentialSchemaResponseDTO;

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
          revocationMethod: RevocationMethod.NONE,
        }),
      );
    });

    it('Issue mdoc array credential', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: driverLicenceSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ECDSA,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });

      await WalletScreen.openDetailScreen(1);
      await expect(CredentialDetailScreen.screen).toBeVisible(1);

      const attributes = [
        {
          index: "0.0",
          key: 'Full Name',
          value: "string",
        },
        {
          index: "0.1.0.0",
          key: 'Category Name',
          value: "string",
        },
        {
          index: "0.1.0.1",
          key: 'Expiry Date',
          value: "8/21/2023",
        },
        {
          index: "0.1.0.2",
          key: 'Issue Date',
          value: "8/21/2023",
        },
      ]
      await CredentialDetailScreen.credentialCard.verifyAttributeValues(attributes);
    });
  });
});
