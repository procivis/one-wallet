import { expect } from 'detox';

import CredentialDetailScreen from './page-objects/CredentialDetailScreen';
import InvitationProcessScreen from './page-objects/InvitationProcessScreen';
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

    await expect(InvitationProcessScreen.screen).toBeVisible();
    await InvitationProcessScreen.closeButton.tap();

    await expect(CredentialDetailScreen.screen).toBeVisible();
    await CredentialDetailScreen.backButton.tap();

    await expect(WalletScreen.screen).toBeVisible();
  });
});
