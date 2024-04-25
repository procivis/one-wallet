import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { CredentialAction, credentialIssuance } from '../helpers/credential';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialDeleteProcessScreen from '../page-objects/CredentialDeleteProcessScreen';
import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import ImagePreviewScreen from '../page-objects/ImagePreviewScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredential,
  createCredentialSchema,
  offerCredential,
  revokeCredential,
  suspendCredential,
} from '../utils/bff-api';
import { formatDate } from '../utils/date';
import {
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

  describe('ONE-620: Credential revocation', () => {
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
      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(CredentialDetailScreen.status.element).toBeVisible();
      await expect(CredentialDetailScreen.status.value).toHaveText('Revoked');
      await expect(CredentialDetailScreen.history(0).element).toExist();
    });
  });

  describe('ONE-1313: Credential revocation LVVC', () => {
    let credentialId: string;

    describe('Suspend credential', () => {
      beforeAll(async () => {
        await launchApp({ delete: true });
      });

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
        const formattedDate = formatDate(suspendedDate);

        await suspendCredential(
          credentialId,
          authToken,
          suspendedDate.toISOString(),
        );

        await reloadApp({ suspendedScreen: true });

        await expect(
          WalletScreen.credential(credentialId).suspendedLabel,
        ).toExist();
        await WalletScreen.credentialName(credentialSchemaJWT_with_LVVC.name)
          .atIndex(0)
          .tap();
        await expect(CredentialDetailScreen.screen).toExist();
        await expect(CredentialDetailScreen.history(0).element).toExist();
        await expect(CredentialDetailScreen.history(0).label).toHaveText(
          'Credential suspended',
        );
        await expect(
          CredentialDetailScreen.credential.suspendedLabel,
        ).toHaveText(`Suspended until ${formattedDate}`);
      });

      it('Suspended credential without date limits', async () => {
        await expect(
          WalletScreen.credentialName(
            credentialSchemaJWT_with_LVVC.name,
          ).atIndex(0),
        ).toBeVisible();

        await suspendCredential(credentialId, authToken);

        await reloadApp({ suspendedScreen: true });

        await expect(
          WalletScreen.credential(credentialId).suspendedLabel,
        ).toExist();
        await WalletScreen.credentialName(credentialSchemaJWT_with_LVVC.name)
          .atIndex(0)
          .tap();
        await expect(CredentialDetailScreen.screen).toExist();
        await expect(CredentialDetailScreen.history(0).element).toExist();
        await expect(CredentialDetailScreen.history(0).label).toHaveText(
          'Credential suspended',
        );
        await expect(
          CredentialDetailScreen.credential.suspendedLabel,
        ).toHaveText('Suspended');
      });
    });

    it('Revoke credential', async () => {
      await reloadApp();

      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(
        WalletScreen.credential(credentialId).revokedLabel,
      ).toExist();

      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.history(0).element).toExist();
      await expect(CredentialDetailScreen.status.value).toHaveText('Revoked');
    });
  });

  describe('ONE-618: Credential deletion', () => {
    let credentialId: string;

    beforeAll(async () => {
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT_with_LVVC,
        transport: Transport.PROCIVIS,
      });
    });

    beforeEach(async () => {
      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action('Delete credential').tap();
    });

    it('Cancel confirmation', async () => {
      await CredentialDetailScreen.action('Cancel').tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(CredentialDetailScreen.status.element).toExist();
      await expect(CredentialDetailScreen.status.value).toHaveText('Valid');

      await CredentialDetailScreen.backButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
    });

    it('Accept confirmation', async () => {
      await CredentialDetailScreen.action('Delete').tap();
      await expect(CredentialDeleteProcessScreen.screen).toBeVisible();
      await expect(CredentialDeleteProcessScreen.status.success).toBeVisible();
      await CredentialDeleteProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible();
      await expect(WalletScreen.credential(credentialId).element).not.toExist();
    });
  });

  describe('ONE-796: OpenID4VC Credential transport', () => {
    const issueCredentialTestCase = async (
      credentialSchema: CredentialSchemaResponseDTO,
    ) => {
      const credentialId = await createCredential(authToken, credentialSchema, {
        transport: Transport.OPENID4VC,
      });

      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);

      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();

      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();

      await expect(WalletScreen.screen).toBeVisible();
      await expect(
        WalletScreen.credentialName(credentialSchema.name).atIndex(0),
      ).toBeVisible();
    };

    it('Issue credential: JWT schema', async () => {
      await issueCredentialTestCase(credentialSchemaJWT);
    });

    it('Issue credential: SD_JWT schema', async () => {
      await issueCredentialTestCase(credentialSchemaSD_JWT);
    });
  });

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
    it('Issue Hardware schema', async () => {
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

  describe('ONE-1233: Picture claim', () => {
    let credentialId: string;
    const pictureKey = 'picture';

    beforeAll(async () => {
      await launchApp({ delete: true });
      const credentialSchema = await createCredentialSchema(authToken, {
        claims: [
          { datatype: DataType.PICTURE, key: pictureKey, required: true },
        ],
      });

      credentialId = await credentialIssuance({
        authToken,
        credentialSchema,
      });
    });

    it('display picture link in credential detail', async () => {
      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(
        CredentialDetailScreen.claim(pictureKey).element,
      ).toBeVisible();
      await CredentialDetailScreen.claim(pictureKey).value.tap();
      await expect(ImagePreviewScreen.screen).toBeVisible();
      await expect(ImagePreviewScreen.title).toHaveText(pictureKey);
    });
  });

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

  describe('ONE-1799: Searching Credential', () => {
    let schema1: CredentialSchemaResponseDTO;
    let schema2: CredentialSchemaResponseDTO;
    let credentialId_1: string;
    let credentialId_2: string;

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
      credentialId_1 = await credentialIssuance({
        authToken,
        credentialSchema: schema1,
      });
      credentialId_2 = await credentialIssuance({
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
      await waitFor(WalletScreen.credential(credentialId_1).element)
        .toBeVisible()
        .withTimeout(2000);
      await expect(
        WalletScreen.credential(credentialId_2).element,
      ).toBeVisible();
    });

    it('Check credential search find only 1 matches', async () => {
      await WalletScreen.search.element.tap();
      await WalletScreen.search.typeText('Schema-2\n');

      await expect(
        WalletScreen.credential(credentialId_2).element,
      ).toBeVisible();
      await waitFor(WalletScreen.credential(credentialId_1).element)
        .not.toBeVisible()
        .withTimeout(3000);
    });
  });
});
