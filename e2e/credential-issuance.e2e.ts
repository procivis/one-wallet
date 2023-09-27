import { expect } from 'detox';

import CredentialAcceptProcessScreen from './page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from './page-objects/CredentialOfferScreen';
import WalletScreen from './page-objects/WalletScreen';
import { bffLogin, createCredential, offerCredential } from './utils/bff-api';
import { pinSetup } from './utils/init';
import { scanURL } from './utils/scan';

describe('Credential issuance', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { camera: 'YES' } });
    await pinSetup();
  });

  it('completes credential issuance', async () => {
    const authToken = await bffLogin();
    const credentialId = await createCredential(authToken);
    const invitationUrl = await offerCredential(credentialId, authToken);
    await scanURL(invitationUrl);

    await expect(CredentialOfferScreen.screen).toBeVisible();
    await CredentialOfferScreen.acceptButton.tap();

    await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
    await CredentialAcceptProcessScreen.closeButton.tap();

    await expect(WalletScreen.screen).toBeVisible();
  });
});
