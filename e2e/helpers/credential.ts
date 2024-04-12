import { expect, waitFor } from 'detox';

import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { bffLogin, createCredential, offerCredential } from '../utils/bff-api';
import { LoadingResultState, Transport } from '../utils/enums';
import { scanURL } from '../utils/scan';

interface credentialIssuanceProps {
  authToken?: string;
  claimValues?: Array<{
    claimId: string;
    claims?: credentialIssuanceProps['claimValues'][];
    value: string;
  }>;
  credentialSchema: CredentialSchemaResponseDTO;
  redirectUri?: string;
  transport?: Transport;
}

export enum CredentialAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

const acceptCredentialTestCase = async (
  credentialId: string,
  data: credentialIssuanceProps,
  expectedResult: LoadingResultState,
) => {
  await device.disableSynchronization();
  await CredentialOfferScreen.acceptButton.tap();
  await expect(CredentialAcceptProcessScreen.screen).toBeVisible();
  await waitFor(CredentialAcceptProcessScreen.screen)
    .toBeVisible()
    .withTimeout(1000);
  await waitFor(CredentialAcceptProcessScreen.closeButton)
    .toBeVisible()
    .withTimeout(2000);
  if (expectedResult === LoadingResultState.Success) {
    await expect(CredentialAcceptProcessScreen.status.success).toBeVisible();
  } else if (expectedResult === LoadingResultState.Failure) {
    await expect(CredentialAcceptProcessScreen.status.failure).toBeVisible();
    await CredentialAcceptProcessScreen.closeButton.tap();
    return;
  }
  // Temporary not working
  // if (data.redirectUri) {
  //   await expect(CredentialAcceptProcessScreen.ctaButton).toBeVisible();
  // }

  await CredentialAcceptProcessScreen.closeButton.tap();
  await expect(WalletScreen.screen).toBeVisible();
  await device.enableSynchronization();
  if (data.transport === Transport.PROCIVIS) {
    await expect(WalletScreen.credential(credentialId).element).toBeVisible();
  } else if (data.transport === Transport.OPENID4VC) {
    await expect(
      WalletScreen.credentialName(data.credentialSchema.name).atIndex(0),
    ).toBeVisible();
  }
};

const rejectCredentialTestCase = async () => {
  await CredentialOfferScreen.rejectButton.tap();
  await expect(WalletScreen.screen).toBeVisible();
};

export const credentialIssuance = async (
  data: credentialIssuanceProps,
  action: CredentialAction = CredentialAction.ACCEPT,
  expectedResult: LoadingResultState = LoadingResultState.Success,
) => {
  if (!data.authToken) {
    data.authToken = await bffLogin();
  }
  const credentialId = await createCredential(
    data.authToken,
    data.credentialSchema,
    {
      claimValues: data.claimValues,
      redirectUri: data.redirectUri,
      transport: data.transport,
    },
  );
  const invitationUrl = await offerCredential(credentialId, data.authToken);
  await scanURL(invitationUrl);

  await expect(CredentialOfferScreen.screen).toBeVisible();
  if (action === CredentialAction.ACCEPT) {
    await acceptCredentialTestCase(credentialId, data, expectedResult);
  } else {
    await rejectCredentialTestCase();
  }
  return credentialId;
};
