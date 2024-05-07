import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { CredentialAction, credentialIssuance } from '../helpers/credential';
import CredentialHistoryScreen from '../page-objects/credential/CredentialHistoryScreen';
import CredentialNerdScreen, {
  Attributes,
  AttributeTestID,
} from '../page-objects/credential/CredentialNerdScreen';
import CredentialDeleteProcessScreen from '../page-objects/CredentialDeleteProcessScreen';
import CredentialDeletePromptScreen from '../page-objects/CredentialDeletePromptScreen';
import CredentialDetailScreen, {
  Action,
} from '../page-objects/CredentialDetailScreen';
import ImagePreviewScreen from '../page-objects/ImagePreviewScreen';
import InvitationErrorDetailsScreen from '../page-objects/invitation/InvitationErrorDetailsScreen';
import InvitationProcessScreen from '../page-objects/InvitationProcessScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredentialSchema,
  getCredentialDetail,
  revokeCredential,
  suspendCredential,
} from '../utils/bff-api';
import { formatDateTime } from '../utils/date';
import {
  CodeType,
  CredentialFormat,
  DataType,
  LoadingResultState,
  RevocationMethod,
  Transport,
  WalletKeyStorageType,
} from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;
  let credentialSchemaJWT: CredentialSchemaResponseDTO;
  let credentialSchemaSD_JWT: CredentialSchemaResponseDTO;
  let credentialSchemaJWT_with_LVVC: CredentialSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();

    authToken = await bffLogin();
    credentialSchemaJWT = await createCredentialSchema(authToken, {
      format: CredentialFormat.JWT,
      revocationMethod: RevocationMethod.STATUSLIST2021,
    });
    credentialSchemaSD_JWT = await createCredentialSchema(authToken, {
      format: CredentialFormat.SDJWT,
      revocationMethod: RevocationMethod.STATUSLIST2021,
    });
    credentialSchemaJWT_with_LVVC = await createCredentialSchema(authToken, {
      format: CredentialFormat.JWT,
      revocationMethod: RevocationMethod.LVVC,
    });
  });

  it('ONE-1800: Empty Credential dashboard', async () => {
    await expect(WalletScreen.screen).toBeVisible();
    await WalletScreen.verifyEmptyCredentialList();
  });

  // Pass
  describe('Credential offer', () => {
    it('Accept credential issuance', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        transport: Transport.OPENID4VC,
      });
    });

    it('Accept credential issuance with redirect URI', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        redirectUri: 'https://www.procivis.ch',
        transport: Transport.OPENID4VC,
      });
    });

    it('Reject credential issuance', async () => {
      await credentialIssuance(
        {
          authToken: authToken,
          credentialSchema: credentialSchemaJWT,
          transport: Transport.OPENID4VC,
        },
        CredentialAction.REJECT,
      );
    });
  });

  // eslint-disable-next-line jest/no-disabled-tests
  describe.skip('ONE-620: Credential revocation', () => {
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        transport: Transport.PROCIVIS,
      });
    });

    it('Credential not revoked initially', async () => {
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(
        WalletScreen.credential(credentialId).revokedLabel,
      ).not.toExist();
    });

    it('Credential revoked remotely', async () => {
      await revokeCredential(credentialId, authToken);

      await reloadApp();

      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(
        WalletScreen.credential(credentialId).revokedLabel,
      ).toExist();
    });

    it('Revoked credential detail screen', async () => {
      await WalletScreen.credential(credentialId).header.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();

      await CredentialDetailScreen.credentialCard.verifyStatus('revoked');

      await expect(
        CredentialDetailScreen.credentialCard.header.label.revoked,
      ).toHaveText('Revoked');
      await expect(CredentialDetailScreen.history(0).element).toExist();
    });
  });

  // Fail
  describe('ONE-1313: LVVC; Credential revocation & Suspension', () => {
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
    });

    describe('Suspend credential', () => {
      beforeEach(async () => {
        credentialId = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchemaJWT_with_LVVC,
          transport: Transport.PROCIVIS,
        });
      });

      it('Suspended credential with specified date', async () => {
        await expect(
          WalletScreen.credentialName(
            credentialSchemaJWT_with_LVVC.name,
          ).atIndex(0),
        ).toBeVisible();
        const suspendedDate = new Date();
        suspendedDate.setHours(0, 0, 0, 0);
        suspendedDate.setDate(suspendedDate.getDate() + 1);
        const formattedDate = formatDateTime(suspendedDate);

        await suspendCredential(
          credentialId,
          authToken,
          suspendedDate.toISOString(),
        );

        await reloadApp({
          credentialIds: [credentialId],
          suspendedScreen: true,
        });

        await expect(
          WalletScreen.credential(credentialId).suspendedLabel,
        ).toExist();
        await WalletScreen.credentialName(credentialSchemaJWT_with_LVVC.name)
          .atIndex(0)
          .tap();
        await expect(CredentialDetailScreen.screen).toExist();
        await CredentialDetailScreen.credentialCard.verifyStatus('suspended');

        await expect(CredentialDetailScreen.history(0).element).toExist();
        await expect(CredentialDetailScreen.history(0).label).toHaveText(
          'Credential suspended',
        );

        await expect(
          CredentialDetailScreen.credentialCard.header.label.suspended,
        ).toHaveText(`Suspended until ${formattedDate}`);
      });

      it('Suspended credential without date limits', async () => {
        await expect(
          WalletScreen.credentialName(
            credentialSchemaJWT_with_LVVC.name,
          ).atIndex(0),
        ).toBeVisible();

        await suspendCredential(credentialId, authToken);

        await reloadApp({
          credentialIds: [credentialId],
          suspendedScreen: true,
        });
        await expect(
          WalletScreen.credential(credentialId).suspendedLabel,
        ).toExist();
        await WalletScreen.credentialName(credentialSchemaJWT_with_LVVC.name)
          .atIndex(0)
          .tap();
        await expect(CredentialDetailScreen.screen).toExist();
        await CredentialDetailScreen.credentialCard.verifyStatus('suspended');
        await expect(
          CredentialDetailScreen.credentialCard.header.label.suspended,
        ).toHaveText('Suspended');

        await expect(CredentialDetailScreen.history(0).element).toExist();
        await expect(CredentialDetailScreen.history(0).label).toHaveText(
          'Credential suspended',
        );
      });
    });

    describe('Revoke credential', () => {
      beforeEach(async () => {
        credentialId = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchemaJWT_with_LVVC,
          transport: Transport.PROCIVIS,
        });
      });

      it('Revoke credential', async () => {
        await revokeCredential(credentialId, authToken);
        await reloadApp({
          credentialIds: [credentialId],
          revokedScreen: true,
        });
        await expect(
          WalletScreen.credential(credentialId).revokedLabel,
        ).toExist();
        await WalletScreen.credentialName(credentialSchemaJWT_with_LVVC.name)
          .atIndex(0)
          .tap();

        await expect(CredentialDetailScreen.history(0).element).toExist();
        await expect(CredentialDetailScreen.history(0).label).toHaveText(
          'Credential revoked',
        );
        await CredentialDetailScreen.credentialCard.verifyStatus('revoked');

        await expect(
          CredentialDetailScreen.credentialCard.header.label.revoked,
        ).toHaveText('Revoked');
      });
    });
  });

  // Fail
  describe('ONE-618: Credential deletion', () => {
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT_with_LVVC,
        transport: Transport.PROCIVIS,
      });
    });

    beforeEach(async () => {
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await WalletScreen.credential(credentialId).header.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action(Action.DELETE_CREDENTIAL).tap();
    });

    it('Cancel confirmation', async () => {
      await CredentialDeletePromptScreen.cancelButton.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(
        CredentialDetailScreen.credentialCard.header.label.revoked,
      ).not.toExist();
      await expect(
        CredentialDetailScreen.credentialCard.header.label.suspended,
      ).not.toExist();

      await CredentialDetailScreen.backButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
    });

    it('Accept confirmation', async () => {
      await device.disableSynchronization();
      await CredentialDeletePromptScreen.deleteButton.longPress(3001);
      await waitFor(CredentialDeleteProcessScreen.screen)
        .toBeVisible()
        .withTimeout(5000);
      await expect(CredentialDeleteProcessScreen.screen).toBeVisible();
      await waitFor(CredentialDeleteProcessScreen.status.success)
        .toBeVisible()
        .withTimeout(3000);
      await CredentialDeleteProcessScreen.closeButton.tap();
      await device.enableSynchronization();
      await expect(WalletScreen.screen).toBeVisible();
      await expect(WalletScreen.credential(credentialId).element).not.toExist();
    });
  });
  // Pass
  describe('ONE-796: OpenID4VC Credential transport', () => {
    it('Issue credential: JWT schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        transport: Transport.OPENID4VC,
      });
    });

    it('Issue credential: SD_JWT schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSD_JWT,
        transport: Transport.OPENID4VC,
      });
    });
  });
  // Pass
  describe('ONE-1697: Wallet key storage location', () => {
    let credentialSchemaSoftware: CredentialSchemaResponseDTO;
    let credentialSchemaHardware: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });

      credentialSchemaSoftware = await createCredentialSchema(authToken, {
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
        walletStorageType: WalletKeyStorageType.SOFTWARE,
      });
      credentialSchemaHardware = await createCredentialSchema(authToken, {
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
        walletStorageType: WalletKeyStorageType.HARDWARE,
      });
    });

    it('Issue Software schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSoftware,
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.credentialName(credentialSchemaSoftware.name).tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
    });

    // Issuance fail because emulator does not have hardware key
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('Issue Hardware schema', async () => {
      await credentialIssuance(
        {
          authToken: authToken,
          credentialSchema: credentialSchemaHardware,
          transport: Transport.OPENID4VC,
        },
        CredentialAction.ACCEPT,
        LoadingResultState.Failure,
      );
    });
  });
  // Pass
  describe('ONE-1233: Picture claim', () => {
    let credentialSchema: CredentialSchemaResponseDTO;
    const pictureKey = 'picture';

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialSchema = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.PICTURE, key: pictureKey, required: true },
        ],
      });

      await credentialIssuance({
        authToken,
        credentialSchema,
      });
    });

    it('display picture link in credential detail', async () => {
      await WalletScreen.credentialName(credentialSchema.name).tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(
        CredentialDetailScreen.credentialCard.attribute(pictureKey).element,
      ).toBeVisible();
      await expect(
        CredentialDetailScreen.credentialCard.attribute(pictureKey).title,
      ).toHaveText('picture');
      await CredentialDetailScreen.credentialCard
        .attribute(pictureKey)
        .element.tap();
      await expect(ImagePreviewScreen.screen).toBeVisible();
      await expect(ImagePreviewScreen.title).toHaveText(pictureKey);
    });
  });
  // Pass
  describe('ONE-1861: Nested claim', () => {
    let credentialSchemaName: string;
    const claims = [
      { datatype: DataType.EMAIL, key: 'email', required: true },
      {
        claims: [
          { datatype: DataType.STRING, key: 'country', required: true },
          { datatype: DataType.STRING, key: 'region', required: true },
          { datatype: DataType.STRING, key: 'city', required: true },
          { datatype: DataType.STRING, key: 'street', required: true },
        ],
        datatype: DataType.OBJECT,
        key: 'address',
        required: true,
      },
    ];
    beforeAll(async () => {
      const credentialSchema = await createCredentialSchema(authToken, {
        claims: claims,
      });
      credentialSchemaName = credentialSchema.name;
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        transport: Transport.OPENID4VC,
      });
    });

    it('Issue credential with object claims', async () => {
      await WalletScreen.credentialName(credentialSchemaName).atIndex(0).tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
    });
  });
  // Tested
  describe('ONE-1799: Searching Credential', () => {
    let schema1: CredentialSchemaResponseDTO;
    let schema2: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      schema1 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first name', required: true },
          { datatype: DataType.STRING, key: 'last name', required: true },
          { datatype: DataType.EMAIL, key: 'email', required: true },
        ],
        name: `Schema-1-${uuidv4()}`,
      });
      schema2 = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.STRING, key: 'first name', required: true },
          { datatype: DataType.STRING, key: 'last name', required: true },
          { datatype: DataType.EMAIL, key: 'email', required: true },
        ],
        name: `Schema-2-${uuidv4()}`,
      });
      await credentialIssuance({
        authToken,
        credentialSchema: schema1,
      });
      await credentialIssuance({
        authToken,
        credentialSchema: schema2,
      });
    });

    afterEach(async () => {
      await WalletScreen.search.clearText();
    });

    it('Searching credential', async () => {
      await expect(WalletScreen.screen).toBeVisible();
      await WalletScreen.search.element.tap();
      await WalletScreen.search.typeText('Schema\n');

      await waitFor(WalletScreen.credentialName(schema1.name).atIndex(1))
        .toBeVisible()
        .withTimeout(2000);
      await expect(
        WalletScreen.credentialName(schema2.name).atIndex(0),
      ).toBeVisible();
    });

    it('Check credential search find only 1 matches', async () => {
      await WalletScreen.search.element.tap();
      await WalletScreen.search.typeText('Schema-2\n');

      await waitFor(WalletScreen.credentialName(schema2.name).atIndex(0))
        .toBeVisible()
        .withTimeout(2000);
      await expect(WalletScreen.credentialName(schema1.name)).not.toBeVisible();
    });
  });
  // Tested
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
    });

    it('Test credential card header', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.credentialName(schema1.name).tap();
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
      await waitFor(CredentialDetailScreen.credentialCard.header.element)
        .toBeVisible()
        .whileElement(by.id('CredentialDetailScreen.content'))
        .scroll(200, 'up');

      await CredentialDetailScreen.credentialCard.collapseOrExpand();
    });

    it('Test credential card body', async () => {
      await CredentialDetailScreen.credentialCard.swipe('right');
    });
  });

  describe('ONE-1879: Credential Schema Layout', () => {
    let schema1: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
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

    it('Detailed credential information', async () => {
      const credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: schema1,
        transport: Transport.OPENID4VC,
      });
      await WalletScreen.credentialName(schema1.name).tap();
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

      await reloadApp({
        suspendedScreen: true,
      });
      await WalletScreen.credentialName(schema1.name).tap();
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

  describe('ONE-1870: Handling Errors in Credential Offering Process', () => {
    it('Wrong share URI', async () => {
      const invitationUrl =
        'https://core.dev.procivis-one.com/ssi/temporary-issuer/v1/connect?protocol=PROCIVIS_TEMPORARY&credential=8a611gad-30b5-4a35-9fa5-b2f86d7279a3';
      await scanURL(invitationUrl);

      await expect(InvitationProcessScreen.screen).toBeVisible();
      await expect(element(by.text('Something went wrong.'))).toBeVisible();
      await InvitationProcessScreen.infoButton.tap();
      await expect(InvitationErrorDetailsScreen.screen).toBeVisible();
      await InvitationErrorDetailsScreen.close.tap();
      await expect(InvitationProcessScreen.screen).toBeVisible();
      await InvitationProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
    });
  });
});
