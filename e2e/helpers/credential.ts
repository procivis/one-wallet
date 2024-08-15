import { expect, waitFor } from 'detox';

import { LoaderViewState } from '../page-objects/components/LoadingResult';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  bffLogin,
  createCredential,
  getLocalDid,
  offerCredential,
} from '../utils/bff-api';
import { DidMethod, Exchange, KeyType } from '../utils/enums';
import { scanURL } from '../utils/scan';

interface CredentialIssuanceProps {
  authToken?: string;
  claimValues?: Array<{
    claimId: string;
    claims?: CredentialIssuanceProps['claimValues'][];
    path: string;
    value: string;
  }>;
  credentialSchema: CredentialSchemaResponseDTO;
  didMethods?: DidMethod | DidMethod[];
  exchange?: Exchange;
  keyAlgorithms?: KeyType | KeyType[];
  redirectUri?: string;
}

export enum CredentialAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

const acceptCredentialTestCase = async (
  credentialId: string,
  data: CredentialIssuanceProps,
  expectedResult: LoaderViewState,
  visibleText?: string,
) => {
  await device.disableSynchronization();
  await expect(CredentialOfferScreen.card).toBeVisible();

  await waitFor(CredentialOfferScreen.acceptButton)
    .toBeVisible()
    .whileElement(by.id('CredentialOfferScreen'))
    .scroll(400, 'down');

  await CredentialOfferScreen.acceptButton.tap();
  await waitFor(CredentialAcceptProcessScreen.screen).toBeVisible();

  if (expectedResult === LoaderViewState.Success) {
    await waitFor(CredentialAcceptProcessScreen.status.success)
      .toBeVisible()
      .withTimeout(6000);

    // if (data.redirectUri) {
    //   await waitFor(CredentialAcceptProcessScreen.button.redirect)
    //     .toBeVisible()
    //     .withTimeout(2000);
    // } else {
    await expect(CredentialAcceptProcessScreen.button.close).toBeVisible();
    // }
  } else if (expectedResult === LoaderViewState.Warning) {
    await waitFor(CredentialAcceptProcessScreen.status.warning)
      .toBeVisible()
      .withTimeout(2000);
    if (visibleText) {
      await CredentialAcceptProcessScreen.hasText(visibleText);
    }
    await CredentialAcceptProcessScreen.closeButton.tap();
    await expect(WalletScreen.screen).toBeVisible();
    await device.enableSynchronization();
    return;
  }
  await expect(CredentialAcceptProcessScreen.closeButton).toBeVisible();
  await CredentialAcceptProcessScreen.closeButton.tap();

  await device.enableSynchronization();
  await expect(WalletScreen.screen).toBeVisible();

  await expect(
    WalletScreen.credentialName(data.credentialSchema.name).atIndex(0),
  ).toBeVisible();
};

const rejectCredentialTestCase = async () => {
  await CredentialOfferScreen.rejectButton.tap();
  await expect(CredentialOfferScreen.rejectAlert.title).toBeVisible();
  await expect(CredentialOfferScreen.rejectAlert.message).toBeVisible();
  await CredentialOfferScreen.rejectAlert.rejectButton.tap();
  await expect(WalletScreen.screen).toBeVisible();
};

export const credentialIssuance = async (
  data: CredentialIssuanceProps,
  action: CredentialAction = CredentialAction.ACCEPT,
  expectedResult: LoaderViewState = LoaderViewState.Success,
  visibleText?: string,
) => {
  if (!data.authToken) {
    data.authToken = await bffLogin();
  }
  const did = await getLocalDid(data.authToken, {
    didMethods: data.didMethods,
    keyAlgorithms: data.keyAlgorithms,
  });
  const credentialId = await createCredential(
    data.authToken,
    data.credentialSchema,
    {
      claimValues: data.claimValues,
      exchange: data.exchange,
      issuerDid: did.id,
      // TODO: issuerKey: did.key,
      redirectUri: data.redirectUri,
    },
  );
  const invitationUrl = await offerCredential(credentialId, data.authToken);
  await scanURL(invitationUrl);

  await expect(CredentialOfferScreen.screen).toBeVisible();
  if (action === CredentialAction.ACCEPT) {
    await acceptCredentialTestCase(
      credentialId,
      data,
      expectedResult,
      visibleText,
    );
  } else {
    await rejectCredentialTestCase();
  }
  return credentialId;
};
