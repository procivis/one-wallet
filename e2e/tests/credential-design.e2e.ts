import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { credentialIssuance } from '../helpers/credential';
import { CarouselImageType } from '../page-objects/components/CredentialCard';
import CredentialHistoryScreen from '../page-objects/credential/CredentialHistoryScreen';
import CredentialNerdScreen, {
  Attributes,
  AttributeTestID,
} from '../page-objects/credential/CredentialNerdScreen';
import CredentialDetailScreen, {
  Action,
} from '../page-objects/CredentialDetailScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredentialSchema,
  getCredentialDetail,
  suspendCredential,
} from '../utils/bff-api';
import {
  CodeType,
  CredentialFormat,
  DataType,
  RevocationMethod,
  Transport,
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
      schema1 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'Attribute 1', required: true },
          { datatype: DataType.STRING, key: 'Attribute 2', required: true },
        ],
        format: CredentialFormat.SDJWT,
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
        name: `credential-detox-e2e-${uuidv4()}`,
        revocationMethod: RevocationMethod.LVVC,
      });
    });

    it('ONE-1873: Accessing Advanced Credential Details ("Nerd Mode")', async () => {
      const credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.openDetailScreen(schema1.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await CredentialDetailScreen.actionButton.tap();
      const credentialDetail = await getCredentialDetail(
        credentialId,
        authToken,
      );
      await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
      await expect(CredentialNerdScreen.screen).toBeVisible();
      await expect(CredentialNerdScreen.entityCluster.name).toHaveText(
        credentialDetail.issuerDid.did,
      );

      const attributes: Attributes = {
        [AttributeTestID.schemaName]: {
          label: 'Credential schema',
          value: credentialDetail.schema.name,
        },
        [AttributeTestID.issuerDID]: {
          label: 'Issuer DID',
          showMoreButton: true,
          value: credentialDetail.issuerDid.did,
        },
        [AttributeTestID.credentialFormat]: {
          label: 'Credential format',
          value: credentialDetail.schema.format,
        },
        [AttributeTestID.revocationMethod]: {
          label: 'Revocation method',
          value: 'LVVC (Linked Validity Verifiable Credential)',
        },
        [AttributeTestID.validity]: {
          label: 'Validity',
          value: 'Valid',
        },
      };
      await CredentialNerdScreen.verifyAttributes(attributes);
      await CredentialNerdScreen.close();
    });
  });

  // Pass
  describe('ONE-1876: Credential full history screen', () => {
    let schema1: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      schema1 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'Attribute 1', required: true },
          { datatype: DataType.STRING, key: 'Attribute 2', required: true },
        ],
        layoutProperties: {
          primaryAttribute: 'Attribute 1',
        },
        name: `credential-${uuidv4()}`,
        revocationMethod: RevocationMethod.LVVC,
      });
    });

    it('Test credential history list', async () => {
      const credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        transport: Transport.OPENID4VC,
      });

      await suspendCredential(credentialId, authToken);

      await reloadApp({ suspendedScreen: true });
      await WalletScreen.openDetailScreen(schema1.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await CredentialDetailScreen.openCredentialHistoryScreen();
      await expect(CredentialHistoryScreen.screen).toBeVisible();

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
      schemaWithoutLayout = await createCredentialSchema(
        authToken,
        {
          claims: [
            { datatype: DataType.STRING, key: 'Attribute 1', required: true },
            { datatype: DataType.STRING, key: 'Attribute 2', required: true },
          ],
          name: `credential without layout ${uuidv4()}`,
        },
        false,
      );
      schemaWithLayout = await createCredentialSchema(
        authToken,
        {
          claims: [
            { datatype: DataType.STRING, key: 'Attribute 1', required: true },
            { datatype: DataType.STRING, key: 'Attribute 2', required: true },
          ],
          layoutProperties: {
            background: {
              color: '#cc66ff',
            },
            logo: {
              backgroundColor: '#ebb1f9',
              fontColor: '#000000',
            },
          },
          name: `credential with layout ${uuidv4()}`,
        },
        false,
      );
    });

    it('Credential card: Schema without layout. Logo & background color the same', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: schemaWithoutLayout,
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.openDetailScreen(schemaWithoutLayout.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
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
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.openDetailScreen(schemaWithLayout.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await CredentialDetailScreen.credentialCard.verifyLogoColor(
        '#ebb1f9',
        '#000000',
      );
      await CredentialDetailScreen.credentialCard.verifyCardBackgroundColor(
        '#cc66ff',
      );
    });
  });

  // Pass
  describe('ONE-2300: Card Stack View: highlight individual Credential', () => {
    let credentialId_1: string;
    let credentialId_2: string;
    let credentialId_3: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
      const schema_1 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'Main region', required: true },
          { datatype: DataType.STRING, key: 'Support region', required: true },
          { datatype: DataType.PICTURE, key: 'Location photo', required: true },
        ],
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
        name: `Scrolling 1 ${uuidv4()}`,
      });

      const schema_2 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first name', required: true },
          { datatype: DataType.STRING, key: 'last name', required: true },
          { datatype: DataType.PICTURE, key: 'Photo', required: true },
        ],
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
        name: `Scrolling 2 ${uuidv4()}`,
      });

      const schema_3 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first name', required: true },
          { datatype: DataType.STRING, key: 'last name', required: true },
        ],
        name: `Scrolling 3 ${uuidv4()}`,
      });

      credentialId_1 = await credentialIssuance({
        authToken,
        credentialSchema: schema_1,
        transport: Transport.PROCIVIS,
      });
      credentialId_2 = await credentialIssuance({
        authToken,
        credentialSchema: schema_2,
        transport: Transport.PROCIVIS,
      });
      credentialId_3 = await credentialIssuance({
        authToken,
        credentialSchema: schema_3,
        transport: Transport.PROCIVIS,
      });
    });

    beforeEach(async () => {
      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Verify last card opened', async () => {
      await WalletScreen.credential(credentialId_1).verifyIsVisible();
      await WalletScreen.credential(credentialId_1).verifyIsCardCollapsed(
        false,
      );

      await WalletScreen.credential(credentialId_2).verifyIsVisible();
      await WalletScreen.credential(credentialId_2).verifyIsCardCollapsed();

      await WalletScreen.credential(credentialId_3).verifyIsVisible();
      await WalletScreen.credential(credentialId_3).verifyIsCardCollapsed();
    });

    it('Expand card, all cards collapse (Except last one)', async () => {
      await WalletScreen.credential(credentialId_3).collapseOrExpand();
      await WalletScreen.credential(credentialId_3).verifyIsCardCollapsed(
        false,
      );

      await WalletScreen.credential(credentialId_2).verifyIsCardCollapsed();
      await WalletScreen.credential(credentialId_1).verifyIsCardCollapsed(
        false,
      );
    });
  });

  // Pass
  describe('ONE-1880: Scrolling Through Credentials in Wallet Dashboard', () => {
    let credentialName: string;

    beforeAll(async () => {
      const schema = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first name', required: true },
          { datatype: DataType.STRING, key: 'last name', required: true },
        ],
        name: `Scrolling test ${uuidv4()}`,
      });
      credentialName = schema.name;
      for (let i = 0; i <= 7; i++) {
        await credentialIssuance({
          authToken,
          credentialSchema: schema,
        });
      }
    }, 220000);

    it('Test scrolling credential list', async () => {
      await WalletScreen.scrollTo(credentialName, 7);
    });
  });

  // Pass
  describe('ONE-1893: Credential Schema Layout', () => {
    let schema1: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });

      schema1 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first name', required: true },
          { datatype: DataType.STRING, key: 'Last name', required: false },
          { datatype: DataType.BIRTH_DATE, key: 'Birthday', required: true },
          { datatype: DataType.PICTURE, key: 'Photo', required: false },
        ],
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
        name: `credential-detox-e2e-${uuidv4()}`,
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.openDetailScreen(schema1.name);
    });

    it('Test credential card header', async () => {
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(CredentialDetailScreen.credentialCard.element).toBeVisible();

      await CredentialDetailScreen.credentialCard.verifyCredentialName(
        schema1.name,
      );
      await CredentialDetailScreen.credentialCard.verifyDetailLabel(
        'string',
        'string',
      );
    });

    it('Test credential card attributes', async () => {
      await CredentialDetailScreen.credentialCard.showAllAttributes();

      await CredentialDetailScreen.credentialCard.verifyAttributeValues([
        { key: 'first name', value: 'string' },
        { key: 'Last name', value: 'string' },
        { key: 'Birthday', value: '2/21/1996' },
      ]);

      await CredentialDetailScreen.scrollTo(
        CredentialDetailScreen.credentialCard.header.name,
        'up',
      );

      await CredentialDetailScreen.credentialCard.collapseOrExpand();
    });

    it('Test credential card body', async () => {
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
});
