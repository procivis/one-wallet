import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { CredentialAction, credentialIssuance } from '../helpers/credential';
import { LoaderViewState } from '../page-objects/components/LoadingResult';
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
  revokeCredential,
  suspendCredential,
} from '../utils/bff-api';
import { formatDateTime } from '../utils/date';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  Exchange,
  KeyType,
  RevocationMethod,
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
        exchange: Exchange.OPENID4VC,
      });
    });

    it('Accept credential issuance with redirect URI', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: Exchange.OPENID4VC,
        redirectUri: 'https://www.procivis.ch',
      });
    });

    it('Reject credential issuance', async () => {
      await credentialIssuance(
        {
          authToken: authToken,
          credentialSchema: credentialSchemaJWT,
          exchange: Exchange.OPENID4VC,
        },
        CredentialAction.REJECT,
      );
    });
  });

  // Pass
  describe('ONE-620: Credential revocation', () => {
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: Exchange.PROCIVIS,
      });
    });

    it('Credential not revoked initially', async () => {
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(
        WalletScreen.credential(credentialId).header.label.revoked,
      ).not.toExist();
    });

    it('Credential revoked remotely', async () => {
      await revokeCredential(credentialId, authToken);

      await reloadApp({ credentialIds: [credentialId], revokedScreen: true });

      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(
        WalletScreen.credential(credentialId).header.label.revoked,
      ).toExist();
    });

    it('Revoked credential detail screen', async () => {
      await WalletScreen.openDetailScreen(credentialId);
      await expect(CredentialDetailScreen.screen).toBeVisible();

      await CredentialDetailScreen.credentialCard.verifyStatus('revoked');

      await expect(
        CredentialDetailScreen.credentialCard.header.label.revoked,
      ).toHaveText('Revoked');
      await expect(CredentialDetailScreen.history(0).element).toExist();
      await expect(CredentialDetailScreen.history(0).label).toHaveText(
        'Credential revoked',
      );
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
          exchange: Exchange.PROCIVIS,
        });
      });

      // eslint-disable-next-line jest/no-disabled-tests
      it.skip('Suspended credential with specified date', async () => {
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
        await WalletScreen.credential(credentialId).verifyStatus('suspended');
        await WalletScreen.openDetailScreen(credentialId);

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
        await WalletScreen.credential(credentialId).verifyStatus('suspended');
        await WalletScreen.openDetailScreen(credentialSchemaJWT_with_LVVC.name);

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
          exchange: Exchange.PROCIVIS,
        });
      });

      it('Revoke credential', async () => {
        await revokeCredential(credentialId, authToken);
        await reloadApp({
          credentialIds: [credentialId],
          revokedScreen: true,
        });

        await WalletScreen.credential(credentialId).verifyStatus('revoked');
        await WalletScreen.openDetailScreen(credentialId);

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

  // Pass
  describe('ONE-618: Credential deletion', () => {
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT_with_LVVC,
        exchange: Exchange.PROCIVIS,
      });
    });

    beforeEach(async () => {
      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await WalletScreen.openDetailScreen(credentialId);
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
      // Long press is not working on android emulator
      if (device.getPlatform() === 'android') {
        return;
      }
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
        exchange: Exchange.OPENID4VC,
      });
    });

    it('Issue credential: SD_JWT schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSD_JWT,
        exchange: Exchange.OPENID4VC,
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
        exchange: Exchange.OPENID4VC,
      });
      await WalletScreen.openDetailScreen(credentialSchemaSoftware.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
    });

    // Issuance fail because emulator does not have hardware key. Check that error appears
    it('Issue Hardware schema', async () => {
      await credentialIssuance(
        {
          authToken: authToken,
          credentialSchema: credentialSchemaHardware,
          exchange: Exchange.OPENID4VC,
        },
        CredentialAction.ACCEPT,
        LoaderViewState.Warning,
        'Your Wallet is incompatible for the defined key storage type.',
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
          {
            array: false,
            datatype: DataType.PICTURE,
            key: pictureKey,
            required: true,
          },
        ],
      });

      await credentialIssuance({
        authToken,
        credentialSchema,
      });
    });

    it('display picture link in credential detail', async () => {
      await WalletScreen.openDetailScreen(credentialSchema.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0').element,
      ).toBeVisible();
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0').title,
      ).toHaveText('picture');
      await CredentialDetailScreen.credentialCard.attribute('0').image.tap();
      await expect(ImagePreviewScreen.screen).toBeVisible();
      await expect(ImagePreviewScreen.title).toHaveText(pictureKey);
      await ImagePreviewScreen.closeButton.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
    });
  });

  // Pass
  describe('ONE-1861: Nested claim', () => {
    let credentialSchemaName: string;
    const claims = [
      { array: false, datatype: DataType.EMAIL, key: 'email', required: true },
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
        exchange: Exchange.OPENID4VC,
      });
    });

    it('Issue credential with object claims', async () => {
      await WalletScreen.openDetailScreen(credentialSchemaName);
      await expect(CredentialDetailScreen.screen).toBeVisible();
    });
  });

  // Pass
  describe('ONE-1799: Searching Credential', () => {
    let schema1: CredentialSchemaResponseDTO;
    let schema2: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      schema1 = await createCredentialSchema(authToken, {
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
            datatype: DataType.EMAIL,
            key: 'email',
            required: true,
          },
        ],
        name: `Schema-1-${uuidv4()}`,
      });
      schema2 = await createCredentialSchema(authToken, {
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
            datatype: DataType.EMAIL,
            key: 'email',
            required: true,
          },
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

  // Pass
  describe('ONE-1870: Handling Errors in Credential Offering Process', () => {
    beforeAll(async () => {
      await reloadApp();
    });

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

  describe('ONE-2063: Boolean DataType', () => {
    let booleanSchema: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      booleanSchema = await createCredentialSchema(authToken, {
        claims: [
          {
            array: false,
            datatype: DataType.BOOLEAN,
            key: 'Vip?',
            required: true,
          },
          {
            array: false,
            datatype: DataType.BOOLEAN,
            key: 'Married?',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'First name',
            required: true,
          },
        ],
        format: CredentialFormat.SDJWT,
        name: `Boolean schema ${uuidv4()}`,
        revocationMethod: RevocationMethod.LVVC,
      });
    });

    it('Issue credential with boolean', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: booleanSchema,
        didMethods: DidMethod.WEB,
        exchange: Exchange.OPENID4VC,
        keyAlgorithms: KeyType.ES256,
      });
      await WalletScreen.openDetailScreen(booleanSchema.name);
      await expect(CredentialDetailScreen.screen).toBeVisible();
      const card = CredentialDetailScreen.credentialCard;
      //Vip?
      await expect(card.attribute('0').value).toHaveText('true');
      //Married?
      await expect(card.attribute('1').value).toHaveText('true');
      //First name
      await expect(card.attribute('2').value).toHaveText('string');
    });
  });
});
