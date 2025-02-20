import { expect, waitFor } from 'detox';

import { LoaderViewState } from '../page-objects/components/LoadingResult';
import CredentialAcceptProcessScreen from '../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../page-objects/CredentialOfferScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { DidDetailDTO } from '../types/did';
import {
  bffLogin,
  createCredential,
  getLocalDid,
  offerCredential,
} from '../utils/bff-api';
import { DidMethod, Exchange, KeyType } from '../utils/enums';
import { scanURL } from '../utils/scan';
import { getIdentifier } from '../utils/utils';

interface DidFilter {
  didMethods?: DidMethod | DidMethod[];
  keyAlgorithms?: KeyType | KeyType[];
}

interface CredentialIssuanceProps {
  authToken?: string;
  claimValues?: Array<{
    claimId: string;
    claims?: CredentialIssuanceProps['claimValues'][];
    path: string;
    value: string;
  }>;
  credentialSchema: CredentialSchemaResponseDTO;
  didData?: DidDetailDTO;
  didFilter?: DidFilter;
  exchange?: Exchange;
  redirectUri?: string;
}

export enum CredentialAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export const acceptCredentialTestCase = async (
  data: CredentialIssuanceProps,
  expectedResult: LoaderViewState,
  visibleText?: string,
) => {
  await device.disableSynchronization();
  await CredentialOfferScreen.credentialCard.verifyIsVisible();

  await CredentialOfferScreen.scrollTo(CredentialOfferScreen.acceptButton);

  await CredentialOfferScreen.acceptButton.tap();
  await waitFor(CredentialAcceptProcessScreen.screen).toBeVisible();

  if (expectedResult === LoaderViewState.Success) {
    await waitFor(CredentialAcceptProcessScreen.status.success)
      .toBeVisible()
      .withTimeout(15000);

    if (data.redirectUri) {
      await waitFor(CredentialAcceptProcessScreen.button.redirect)
        .toBeVisible()
        .withTimeout(2000);
    } else {
      await expect(CredentialAcceptProcessScreen.button.close).toBeVisible();
    }
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

export const offerCredentialAndReviewCredentialOfferScreen = async (
  data: CredentialIssuanceProps,
) => {
  if (!data.authToken) {
    data.authToken = await bffLogin();
  }

  let issuerDidId: string;
  if (data.didData) {
    issuerDidId = data.didData.id;
  } else {
    const did = await getLocalDid(data.authToken, {
      didMethods: data.didFilter?.didMethods,
      keyAlgorithms: data.didFilter?.keyAlgorithms,
    });
    issuerDidId = did.id;
  }

  const credentialId = await createCredential(
    data.authToken,
    data.credentialSchema,
    {
      claimValues: data.claimValues,
      exchange: data.exchange ?? Exchange.OPENID4VC,
      issuerDid: issuerDidId,
      // TODO: issuerKey: did.key,
      redirectUri: data.redirectUri,
    },
  );
  const invitationUrl = await offerCredential(credentialId, data.authToken);
  await scanURL(invitationUrl);
  await waitFor(CredentialOfferScreen.screen).toBeVisible().withTimeout(15000);
  await CredentialOfferScreen.credentialCard.verifyIsVisible();
  const holderCredentialId =
    (
      await getIdentifier(element(by.id(/^HolderCredentialID.value.[\w-]+$/)))
    )?.replace('HolderCredentialID.value.', '') || '';
  return {
    holderCredentialId: holderCredentialId,
    issuerCredentialId: credentialId,
  };
};

export const credentialIssuance = async (
  data: CredentialIssuanceProps,
  action: CredentialAction = CredentialAction.ACCEPT,
  expectedResult: LoaderViewState = LoaderViewState.Success,
  visibleText?: string,
) => {
  const credentialIds = await offerCredentialAndReviewCredentialOfferScreen(
    data,
  );

  if (action === CredentialAction.ACCEPT) {
    await acceptCredentialTestCase(data, expectedResult, visibleText);
  } else {
    await rejectCredentialTestCase();
  }
  return credentialIds;
};
