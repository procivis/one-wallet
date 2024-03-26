import { expect } from 'detox';

import { CredentialAction, credentialIssuance } from '../helpers/credential';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialDeleteProcessScreen from '../page-objects/CredentialDeleteProcessScreen';
import CredentialDetailScreen from '../page-objects/CredentialDetailScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import CredentialValidityProcessScreen from '../page-objects/CredentialValidityProcessScreen';
import ImagePreviewScreen from '../page-objects/ImagePreviewScreen';
import PinCodeScreen from '../page-objects/PinCodeScreen';
import WalletScreen from '../page-objects/WalletScreen';
import {
  bffLogin,
  createCredential,
  createCredentialSchema,
  offerCredential,
  revokeCredential,
} from '../utils/bff-api';
import { CredentialFormat, RevocationMethod, Transport } from '../utils/enums';
import { pinSetup } from '../utils/init';
import { scanURL } from '../utils/scan';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;
  let credentialSchemaJWT: Record<string, any>;
  let credentialSchemaSD_JWT: Record<string, any>;
  let credentialSchemaJWT_with_LVVC: Record<string, any>;

  beforeAll(async () => {
    await device.launchApp({ permissions: { camera: 'YES' } });
    await pinSetup();
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
      await device.launchApp({ newInstance: true });
      await expect(PinCodeScreen.Check.screen).toBeVisible();
      await PinCodeScreen.Check.digit(1).multiTap(6);
      await expect(WalletScreen.screen).toBeVisible();

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
      await expect(CredentialDetailScreen.log('revoked')).toExist();
    });
  });

  describe('ONE-1313: Credential revocation LVVC', () => {
    let credentialId: string;

    beforeAll(async () => {
      credentialId = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT_with_LVVC,
        transport: Transport.PROCIVIS,
      });
    });

    it('Check valid on the detail page', async () => {
      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.log('issued')).toExist();
      await expect(CredentialDetailScreen.status.value).toHaveText('Valid');
    });

    it('Check validity remote', async () => {
      await expect(CredentialDetailScreen.screen).toBeVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action('Check validity').tap();
      await expect(CredentialValidityProcessScreen.screen).toBeVisible();
      await CredentialValidityProcessScreen.verifySuccessScreenVisible();

      await CredentialValidityProcessScreen.closeButton.tap();
      await expect(CredentialDetailScreen.screen).toBeVisible();
    });

    it('Revoke credential', async () => {
      await revokeCredential(credentialId, authToken);
      await device.launchApp({ newInstance: true });
      await expect(PinCodeScreen.Check.screen).toBeVisible();
      await PinCodeScreen.Check.digit(1).multiTap(6);
      await expect(WalletScreen.screen).toBeVisible();

      await expect(WalletScreen.credential(credentialId).element).toBeVisible();
      await expect(
        WalletScreen.credential(credentialId).revokedLabel,
      ).toExist();

      await WalletScreen.credential(credentialId).element.tap();
      await expect(CredentialDetailScreen.log('revoked')).toExist();
      await expect(CredentialDetailScreen.status.value).toHaveText('Revoked');
      await CredentialDetailScreen.actionButton.tap();
      await expect(
        CredentialDetailScreen.action('Check validity'),
      ).not.toBeVisible();
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
      credentialSchema: Record<string, any>,
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

  describe('ONE-1233: Picture claim', () => {
    let credentialId: string;
    const pictureKey = 'picture';

    beforeAll(async () => {
      await device.launchApp({ delete: true, permissions: { camera: 'YES' } });
      await pinSetup();
      const credentialSchema = await createCredentialSchema(authToken, {
        claims: [{ datatype: 'PICTURE', key: pictureKey, required: true }],
      });

      credentialId = await createCredential(authToken, credentialSchema);
      const invitationUrl = await offerCredential(credentialId, authToken);
      await scanURL(invitationUrl);

      await expect(CredentialOfferScreen.screen).toBeVisible();
      await CredentialOfferScreen.acceptButton.tap();

      await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
      await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
      await CredentialAcceptProcessScreen.closeButton.tap();
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
});
