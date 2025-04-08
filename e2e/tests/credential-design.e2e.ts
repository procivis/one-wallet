import { expect } from 'detox';

import { getAttributeClaims, mDocCredentialClaims } from '../helpers/claims';
import { credentialIssuance } from '../helpers/credential';
import {
  getCredentialSchemaData,
  mDocCredentialSchema,
} from '../helpers/credentialSchemas';
import {
  CarouselImageType,
  CredentialStatus,
} from '../page-objects/components/CredentialCard';
import { Attributes } from '../page-objects/components/NerdModeScreen';
import CredentialDetailScreen, {
  Action,
} from '../page-objects/credential/CredentialDetailScreen';
import CredentialHistoryScreen from '../page-objects/credential/CredentialHistoryScreen';
import CredentialNerdScreen, {
  AttributeTestID,
} from '../page-objects/credential/CredentialNerdScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredentialSchema,
  getCredentialDetail,
  revokeCredential,
  suspendCredential,
} from '../utils/bff-api';
import {
  CodeType,
  CredentialFormat,
  DataType,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
} from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';

describe('ONE-2014: Credential design', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();

    authToken = await bffLogin();
  });

  // Pass
  describe('ONE-1879: Credential Schema Layout', () => {
    let schema1: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      const schemaData = getCredentialSchemaData({
        allowSuspension: true,
        claims: getAttributeClaims(),
        format: CredentialFormat.SD_JWT,
        layoutProperties: {
          code: {
            attribute: 'Attribute 1',
            type: CodeType.QrCode,
          },
          logo: {
            backgroundColor: '#ebb1f9',
            fontColor: '#000000',
          },
          primaryAttribute: 'Attribute 1',
          secondaryAttribute: 'Attribute 2',
        },
        revocationMethod: RevocationMethod.LVVC,
      });
      schema1 = await createCredentialSchema(authToken, schemaData);
    });

    it('ONE-1873: Accessing Advanced Credential Details ("Nerd Mode")', async () => {
      const issuerHolderCredentialIds = await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        didFilter: {
          didMethods: DidMethod.JWK,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      const credentialId = issuerHolderCredentialIds.issuerCredentialId;
      await WalletScreen.openDetailScreen(0);
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await CredentialDetailScreen.actionButton.tap();
      const credentialDetail = await getCredentialDetail(
        credentialId,
        authToken,
      );
      await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
      await expect(CredentialNerdScreen.screen).toBeVisible(1);
      await expect(CredentialNerdScreen.entityCluster.name).toHaveText(
        'Unknown issuer',
      );

      const attributes: Attributes<AttributeTestID> = {
        [AttributeTestID.schemaName]: {
          label: 'Credential schema',
          value: credentialDetail.schema.name,
        },
        [AttributeTestID.validity]: {
          label: 'Validity',
          value: 'Valid',
        },
        [AttributeTestID.issuerDID]: {
          label: 'Issuer DID',
          value: credentialDetail.issuerDid.did,
        },
        [AttributeTestID.dateAdded]: {
          label: 'Date added',
          onlyValueVisibility: true,
        },
        [AttributeTestID.credentialFormat]: {
          label: 'Credential format',
          value: credentialDetail.schema.format,
        },
        [AttributeTestID.documentType]: {
          label: 'Document type',
          value: credentialDetail.schema.schemaId,
        },
        [AttributeTestID.revocationMethod]: {
          label: 'Revocation method',
          value: 'LVVC',
        },
        [AttributeTestID.storageType]: {
          label: 'Storage type',
          value: credentialDetail.schema.walletStorageType as string,
        },
        [AttributeTestID.schema]: {
          label: 'Credential schema',
          onlyValueVisibility: true,
        },
      };
      await CredentialNerdScreen.verifyAttributes(attributes);
      await CredentialNerdScreen.back.tap();
    });
  });

  // Fail
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('ONE-1876: Credential full history screen', () => {
    let schema1: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      const schemaData = getCredentialSchemaData({
        allowSuspension: true,
        claims: getAttributeClaims(),
        format: CredentialFormat.SD_JWT,
        layoutProperties: {
          primaryAttribute: 'Attribute 1',
        },
        revocationMethod: RevocationMethod.LVVC,
      });
      schema1 = await createCredentialSchema(authToken, schemaData);
    });

    it('Test credential history list', async () => {
      const issuerHolderCredentialIds = await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      const credentialId = issuerHolderCredentialIds.issuerCredentialId;

      await suspendCredential(credentialId, authToken);

      await reloadApp({
        credentialUpdate: [
          {
            expectedLabel: 'Suspended',
            index: 0,
            status: CredentialStatus.SUSPENDED,
          },
        ],
      });

      await revokeCredential(credentialId, authToken);

      await reloadApp({
        credentialUpdate: [
          {
            expectedLabel: 'Revalidated',
            index: 0,
            status: CredentialStatus.SUSPENDED,
          },
        ],
      });

      await WalletScreen.openDetailScreen(0);
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await CredentialDetailScreen.openCredentialHistoryScreen();
      await expect(CredentialHistoryScreen.screen).toBeVisible(1);

      await expect(CredentialHistoryScreen.history(0).element).toBeVisible();
      const labels = [
        'Credential suspended',
        'Credential issued',
        'Credential pending offer',
        'Credential offered',
      ];
      await CredentialHistoryScreen.verifyHistoryLabels(labels);
    });

    it('Search test', async () => {
      await WalletScreen.openDetailScreen(0);
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await CredentialDetailScreen.openCredentialHistoryScreen();
      await expect(CredentialHistoryScreen.screen).toBeVisible(1);
      await CredentialHistoryScreen.search.typeText('Hello');
      await expect(
        CredentialHistoryScreen.history(0).element,
      ).not.toBeVisible();
      await CredentialHistoryScreen.search.clearText();
    });
  });

  // Pass
  describe('ONE-2322, ONE-1893: Customizing Credential Schema Layout', () => {
    let schemaWithoutLayout: CredentialSchemaResponseDTO;
    let schemaWithLayout: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      const schemaDataWithoutLayout = getCredentialSchemaData({
        claims: getAttributeClaims(),
        format: CredentialFormat.JWT,
      });
      schemaWithoutLayout = await createCredentialSchema(
        authToken,
        schemaDataWithoutLayout,
      );

      const schemaDataWithLayout = getCredentialSchemaData({
        claims: getAttributeClaims(),
        format: CredentialFormat.JWT,
        layoutProperties: {
          background: {
            color: '#cc66ff',
          },
          logo: {
            backgroundColor: '#ebb1f9',
            fontColor: '#000000',
          },
        },
        revocationMethod: RevocationMethod.STATUSLIST2021,
      });
      schemaWithLayout = await createCredentialSchema(
        authToken,
        schemaDataWithLayout,
      );
    });

    it('Credential card: Schema without layout. Logo & background color the same', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: schemaWithoutLayout,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await WalletScreen.openDetailScreen(0);
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await CredentialDetailScreen.credentialCard.verifyLogoColor(
        '#5A69F3',
        '#FFFFFF',
      );
      await CredentialDetailScreen.credentialCard.verifyCardBackgroundColor(
        '#5A69F3',
      );
    });

    it('Credential card: Schema with layout.', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: schemaWithLayout,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13
      });
      await WalletScreen.openDetailScreen(0);
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await CredentialDetailScreen.credentialCard.verifyLogoColor(
        '#ebb1f9',
        '#000000',
      );
      await CredentialDetailScreen.credentialCard.verifyCardBackgroundColor(
        '#cc66ff',
      );
    });
  });

  // FAIL
  describe('ONE-2300: Card Stack View: highlight individual Credential', () => {
    beforeAll(async () => {
      await launchApp({ delete: true });
      const schemaData1 = getCredentialSchemaData({
        claims: [
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Main region',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'Support region',
            required: true,
          },
          {
            array: false,
            datatype: DataType.PICTURE,
            key: 'Location photo',
            required: true,
          },
        ],
        format: CredentialFormat.JWT,
        layoutProperties: {
          background: {
            color: '#7C3D2F',
          },
          code: {
            attribute: 'Main region',
            type: CodeType.QrCode,
          },
          logo: {
            backgroundColor: '#1A7437',
            fontColor: '#2E1A74',
          },
          pictureAttribute: 'Location photo',
          primaryAttribute: 'Main region',
          secondaryAttribute: 'Support region',
        },
      });
      const schema_1 = await createCredentialSchema(authToken, schemaData1);
      const schemaData2 = getCredentialSchemaData({
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
            datatype: DataType.PICTURE,
            key: 'Photo',
            required: true,
          },
        ],
        format: CredentialFormat.JSON_LD_CLASSIC,
        layoutProperties: {
          background: {
            color: '#cc66ff',
          },
          code: {
            attribute: 'first name',
            type: CodeType.QrCode,
          },
          logo: {
            backgroundColor: '#ebb1f9',
            fontColor: '#000000',
          },
          pictureAttribute: 'Photo',
          primaryAttribute: 'first name',
          secondaryAttribute: 'last name',
        },
      });

      const schema_2 = await createCredentialSchema(authToken, schemaData2);

      const schemaData3 = getCredentialSchemaData({
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
        ],
        format: CredentialFormat.SD_JWT_VC,
      });
      const schema_3 = await createCredentialSchema(authToken, schemaData3);

      await credentialIssuance({
        authToken,
        credentialSchema: schema_1,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await credentialIssuance({
        authToken,
        credentialSchema: schema_2,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await credentialIssuance({
        authToken,
        credentialSchema: schema_3,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    }, 220000);

    beforeEach(async () => {
      await expect(WalletScreen.screen).toBeVisible(1);
    });

    it('Verify last card opened', async () => {
      const card_0 = await WalletScreen.credentialAtIndex(0);
      await card_0.verifyIsVisible(true, 10);
      await card_0.verifyIsCardCollapsed();

      const card_1 = await WalletScreen.credentialAtIndex(1);
      await card_1.verifyIsVisible(true, 10);
      await card_1.verifyIsCardCollapsed();

      const card_2 = await WalletScreen.credentialAtIndex(2);
      await card_2.verifyIsVisible();
      await card_2.verifyIsCardCollapsed(false);
    });

    it('Expand card, all cards collapse (Except last one)', async () => {
      const card_0 = await WalletScreen.credentialAtIndex(0);
      const card_1 = await WalletScreen.credentialAtIndex(1);
      const card_2 = await WalletScreen.credentialAtIndex(2);

      await card_0.collapseOrExpand();
      await card_0.verifyIsCardCollapsed(false);
      await card_1.verifyIsCardCollapsed();
      await card_2.verifyIsCardCollapsed(false);

      await card_1.collapseOrExpand();
      await card_0.verifyIsCardCollapsed();
      await card_1.verifyIsCardCollapsed(false);
      await card_2.verifyIsCardCollapsed(false);
    });
  });

  // Pass. Skipped. Long tests
  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('ONE-1880: Scrolling Through Credentials in Wallet Dashboard', () => {
    let credentialName: string;

    beforeAll(async () => {
      const schemaData = getCredentialSchemaData({
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
        ],
        format: CredentialFormat.JWT,
      });
      const schema = await createCredentialSchema(authToken, schemaData);
      credentialName = schema.name;
      for (let i = 0; i <= 7; i++) {
        await credentialIssuance({
          authToken,
          credentialSchema: schema,
        });
      }
    }, 400000);

    it('Test scrolling credential list', async () => {
      await WalletScreen.scrollTo(credentialName, 7);
    });
  });

  // Pass
  describe('ONE-1893: Credential Schema Layout', () => {
    let schema1: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      const schemaData = getCredentialSchemaData({
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
            key: 'Last name',
            required: false,
          },
          {
            array: false,
            datatype: DataType.BIRTH_DATE,
            key: 'Birthday',
            required: true,
          },
          {
            array: false,
            datatype: DataType.PICTURE,
            key: 'Photo',
            required: false,
          },
        ],
        format: CredentialFormat.SD_JWT_VC,
        layoutProperties: {
          code: {
            attribute: 'first name',
            type: CodeType.QrCode,
          },
          logo: {
            backgroundColor: '#ebb1f9',
            fontColor: '#000000',
          },
          pictureAttribute: 'Photo',
          primaryAttribute: 'first name',
          secondaryAttribute: 'Last name',
        },
      });
      schema1 = await createCredentialSchema(authToken, schemaData);
      await credentialIssuance({
        authToken: authToken,
        claimValues: [
          {
            claimId: schema1.claims[0].id,
            path: schema1.claims[0].key,
            value: 'John',
          },
          {
            claimId: schema1.claims[1].id,
            path: schema1.claims[1].key,
            value: 'Connor',
          },
          {
            claimId: schema1.claims[2].id,
            path: schema1.claims[2].key,
            value: '1984-10-26T00:00:00.000Z',
          },
          {
            claimId: schema1.claims[3].id,
            path: schema1.claims[3].key,
            value:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
          },
        ],
        credentialSchema: schema1,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await WalletScreen.openDetailScreen(0);
    });

    it('Test credential card header', async () => {
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await expect(CredentialDetailScreen.credentialCard.element).toBeVisible();

      await CredentialDetailScreen.credentialCard.verifyCredentialName(
        schema1.name,
      );
      await CredentialDetailScreen.credentialCard.verifyDetailLabel(
        'John',
        'Connor',
      );
    });

    it('Test credential card attributes', async () => {
      await CredentialDetailScreen.scrollTo(
        CredentialDetailScreen.credentialCard.showAllAttributesButton,
      );
      await CredentialDetailScreen.credentialCard.showAllAttributes();

      await CredentialDetailScreen.credentialCard.verifyAttributeValues(
        [
          { index: '0', key: 'first name', value: 'John' },
          { index: '1', key: 'Last name', value: 'Connor' },
          { index: '2', key: 'Birthday', value: '10/26/1984' },
          { image: true, index: '3', key: 'Photo' },
        ],
        CredentialDetailScreen.scrollTo,
      );

      await CredentialDetailScreen.scrollTo(
        CredentialDetailScreen.credentialCard.header.name,
        'up',
      );

      await CredentialDetailScreen.credentialCard.collapseOrExpand();
    });
    // FAIL
    it('Test credential carousel', async () => {
      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.Photo,
      );
      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.QrCode,
        false,
      );

      await CredentialDetailScreen.credentialCard.swipe('right');

      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.QrCode,
      );
      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.Photo,
        false,
      );
    });
  });

  // Pass
  describe('ONE-2395: Credential Layout mDoc', () => {
    let mdocSchema: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      mdocSchema = await mDocCredentialSchema(authToken);
      await credentialIssuance({
        authToken: authToken,
        claimValues: mDocCredentialClaims(mdocSchema),
        credentialSchema: mdocSchema,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ECDSA,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await WalletScreen.openDetailScreen(0);
    });

    it('Test credential card header', async () => {
      await expect(CredentialDetailScreen.screen).toBeVisible(1);
      await expect(CredentialDetailScreen.credentialCard.element).toBeVisible();

      await CredentialDetailScreen.credentialCard.verifyCredentialName(
        mdocSchema.name,
      );
      await CredentialDetailScreen.credentialCard.verifyDetailLabel(
        'Wade',
        'Wilson',
      );
    });

    it('Test collapse & expand card', async () => {
      await CredentialDetailScreen.credentialCard.collapseOrExpand();
      await CredentialDetailScreen.credentialCard.verifyIsCardCollapsed();
      await CredentialDetailScreen.credentialCard.collapseOrExpand();
      await CredentialDetailScreen.credentialCard.verifyIsCardCollapsed(false);
    });

    it('Test credential carousel', async () => {
      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.Photo,
      );
      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.QrCode,
        false,
      );

      await CredentialDetailScreen.credentialCard.swipe('right');

      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.QrCode,
      );
      await CredentialDetailScreen.credentialCard.verifyImageIsVisible(
        CarouselImageType.Photo,
        false,
      );
    });

    it('Test credential background color', async () => {
      await CredentialDetailScreen.credentialCard.verifyCardBackgroundColor(
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        mdocSchema.layoutProperties.background?.color!,
      );
    });

    it('Test logo background colors', async () => {
      await CredentialDetailScreen.credentialCard.verifyLogoColor(
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        mdocSchema.layoutProperties.logo?.backgroundColor!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        mdocSchema.layoutProperties.logo?.fontColor!,
      );
    });

    it('Test credential card attributes', async () => {
      await CredentialDetailScreen.credentialCard.verifyAttributeValues(
        [
          { index: '0.0', key: 'country', value: 'CH' },
          { index: '0.1', key: 'region', value: 'Zurich' },
          { index: '0.2', key: 'city', value: 'Zurich' },
          { index: '0.3', key: 'street', value: 'strasse' },
          { index: '1.0', key: 'first name', value: 'Wade' },
          { index: '1.1', key: 'last name', value: 'Wilson' },
          { index: '1.2', key: 'Birthday', value: '1/17/2018' },
          { image: true, index: '1.3', key: 'image' },
          { index: '2.0.0.0', key: 'Category', value: 'A' },
          { index: '2.0.0.1', key: 'Expired', value: '9/29/2026' },
          { index: '2.0.1.0', key: 'Category', value: 'B' },
          { index: '2.0.1.1', key: 'Expired', value: '9/30/2030' },
          { index: '2.0.2.0', key: 'Category', value: 'C' },
          { index: '2.0.2.1', key: 'Expired', value: '9/28/2027' },
        ],
        CredentialDetailScreen.scrollTo,
      );
    });
  });
});
