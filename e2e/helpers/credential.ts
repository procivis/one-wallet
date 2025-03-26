import { expect, waitFor } from 'detox';

import {
  delay,
  waitForElementVisible,
} from '../page-objects/components/ElementUtil';
import { LoaderViewState } from '../page-objects/components/LoadingResult';
import RemoteSecureElementInfoScreen from '../page-objects/credential/rse/RemoteSecureElementInfoScreen';
import RemoteSecureElementPinSetupScreen from '../page-objects/credential/rse/RemoteSecureElementPinSetupScreen';
import RemoteSecureElementSignScreen from '../page-objects/credential/rse/RemoteSecureElementSignScreen';
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
import {
  DidMethod,
  Exchange,
  KeyType,
  URLOption,
  WalletKeyStorageType,
} from '../utils/enums';
import { LONG_WAIT_TIME, RSEConfig } from '../utils/init';
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
  invitationUrlType?: URLOption;
  redirectUri?: string;
  rseConfig?: RSEConfig;
}

export enum CredentialAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

const acceptRSECredential = async (
  rseConfig: RSEConfig = { PINCode: '12345', isRSEOnboarded: false },
) => {
  if (!rseConfig.isRSEOnboarded) {
    await expect(RemoteSecureElementInfoScreen.screen).toBeVisible(1);
    await expect(RemoteSecureElementInfoScreen.continueButton).toBeVisible();
    if (device.getPlatform() === 'ios') {
      await delay(1000); // Need delay for ios
    }
    await RemoteSecureElementInfoScreen.continueButton.tap();
    await waitForElementVisible(
      RemoteSecureElementPinSetupScreen.screen,
      LONG_WAIT_TIME,
      1,
    );
    await RemoteSecureElementPinSetupScreen.fillRemotePINCode(
      rseConfig.PINCode,
    );
    await RemoteSecureElementPinSetupScreen.fillRemotePINCode(
      rseConfig.PINCode,
    );
  }
  await waitForElementVisible(
    CredentialAcceptProcessScreen.screen,
    LONG_WAIT_TIME,
    1,
  );
  await RemoteSecureElementSignScreen.waitForScreenDisplayedAndFillPINCode(
    rseConfig.PINCode,
  );
};

export const acceptCredentialTestCase = async (
  data: CredentialIssuanceProps,
  expectedResult: LoaderViewState,
  visibleText?: string,
) => {
  await device.disableSynchronization();
  await CredentialOfferScreen.credentialCard.verifyIsVisible();

  await CredentialOfferScreen.scrollTo(CredentialOfferScreen.acceptButton);

  await CredentialOfferScreen.acceptButton.tap();

  if (
    data.credentialSchema.walletStorageType ===
    WalletKeyStorageType.REMOTE_SECURE_ELEMENT
  ) {
    await acceptRSECredential(data.rseConfig);
  }

  if (expectedResult === LoaderViewState.Success) {
    await waitFor(CredentialAcceptProcessScreen.status.success)
      .toBeVisible(1)
      .withTimeout(25000);

    if (data.redirectUri) {
      await waitFor(CredentialAcceptProcessScreen.button.redirect)
        .toBeVisible()
        .withTimeout(2000);
    } else {
      await expect(CredentialAcceptProcessScreen.closeButton).toBeVisible();
    }
  } else if (expectedResult === LoaderViewState.Warning) {
    await waitFor(CredentialAcceptProcessScreen.status.warning)
      .toBeVisible()
      .withTimeout(2000);
    if (visibleText) {
      await CredentialAcceptProcessScreen.hasText(visibleText);
    }
    await CredentialAcceptProcessScreen.closeButton.tap();
    await expect(WalletScreen.screen).toBeVisible(1);
    await device.enableSynchronization();
    return;
  }

  await expect(CredentialAcceptProcessScreen.closeButton).toBeVisible();
  await CredentialAcceptProcessScreen.closeButton.tap();

  await device.enableSynchronization();
  await expect(WalletScreen.screen).toBeVisible(1);

  await expect(
    (
      await WalletScreen.credentialAtIndex(0)
    ).header.name,
  ).toBeVisible();
};

const rejectCredentialTestCase = async () => {
  await CredentialOfferScreen.rejectButton.tap();
  await expect(CredentialOfferScreen.rejectAlert.title).toBeVisible();
  await expect(CredentialOfferScreen.rejectAlert.message).toBeVisible();
  await CredentialOfferScreen.rejectAlert.rejectButton.tap();
  await expect(WalletScreen.screen).toBeVisible(1);
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
      redirectUri: data.redirectUri,
    },
  );
  const invitationUrls = await offerCredential(credentialId, data.authToken);
  const invitationUrl =
    data.invitationUrlType === URLOption.UNIVERSAL_LINK
      ? invitationUrls.appUrl
      : invitationUrls.url;
  await scanURL(invitationUrl);
  await waitFor(CredentialOfferScreen.screen).toBeVisible(1).withTimeout(25000);
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
