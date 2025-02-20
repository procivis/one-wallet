import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { credentialIssuance } from '../helpers/credential';
import {
  mDocCredentialClaims,
  mDocCredentialSchema,
} from '../helpers/credentialSchemas';
import CredentialDetailScreen from '../page-objects/credential/CredentialDetailScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredentialSchema,
  suspendCredential,
} from '../utils/bff-api';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  Exchange,
  KeyType,
  RevocationMethod,
} from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();
    authToken = await bffLogin();
  });

  describe('ONE-2054: Issue mdoc credentials', () => {
    let mdocSchema: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      mdocSchema = await createCredentialSchema(authToken, {
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
        revocationMethod: RevocationMethod.NONE,
        schemaId: `org.iso.18013.5.1.mDL-${uuidv4()}`,
      });
    });

    it('Issue mdoc credential', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: mdocSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ES256,
        },
        exchange: Exchange.OPENID4VC,
      });
    });
  });

  describe('ONE-2227: Issue mdoc array credentials', () => {
    let driverLicenceSchema: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      driverLicenceSchema = await createCredentialSchema(authToken, {
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
        schemaId: `org.iso.18013.5.1.mDL-${uuidv4()}`,
      });
    });

    it('Issue mdoc array credential', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: driverLicenceSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ES256,
        },
        exchange: Exchange.OPENID4VC,
      });

      await WalletScreen.openDetailScreen(0);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      // Full Name
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0.0').element,
      ).toBeVisible();
      // Category Name
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0.1.0').element,
      ).toBeVisible();
      //Issue Date
      await CredentialDetailScreen.scrollTo(
        CredentialDetailScreen.credentialCard.attribute('0.1.1').element,
      );
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0.1.1').element,
      ).toBeVisible();
      await CredentialDetailScreen.scrollTo(
        CredentialDetailScreen.credentialCard.attribute('0.1.2').element,
      );
      // Expiry Date
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0.1.2').element,
      ).toBeVisible();
    });
  });

  describe('ONE-2908: Suspension of mdoc credentials', () => {
    let mdocSchema: CredentialSchemaResponseDTO;
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
      mdocSchema = await mDocCredentialSchema(
        authToken,
        RevocationMethod.MDOC_MSO_UPDATE_SUSPENSION,
      );
      const issuerHolderCredentialIds = await credentialIssuance({
        authToken: authToken,
        claimValues: mDocCredentialClaims(mdocSchema),
        credentialSchema: mdocSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ES256,
        },
        exchange: Exchange.OPENID4VC,
      });
      credentialId = issuerHolderCredentialIds.issuerCredentialId;
    });

    it('Suspend mDoc credential with infinite date', async () => {
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.credentialCard.verifyDetailLabel(
        'Wade',
        'Wilson',
      );
      await suspendCredential(credentialId, authToken);
      await reloadApp();
    });
  });
});
