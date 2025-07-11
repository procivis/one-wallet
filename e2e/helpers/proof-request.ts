import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import {
  waitForElementIsNotPresent,
  waitForElementPresent,
  waitForElementVisible,
} from '../page-objects/components/ElementUtil';
import { LoaderViewState } from '../page-objects/components/LoadingResult';
import RemoteSecureElementSignScreen from '../page-objects/credential/rse/RemoteSecureElementSignScreen';
import ProofRequestAcceptProcessScreen from '../page-objects/proof-request/ProofRequestAcceptProcessScreen';
import ProofRequestSharingScreen from '../page-objects/proof-request/ProofRequestSharingScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  CreateProofSchemaRequestDTO,
  ProofInputSchemasRequestDTO,
  ProofSchemaResponseDTO,
} from '../types/proof';
import {
  createProofRequest,
  createProofSchema,
  getLocalDid,
  requestProof,
} from '../utils/api';
import { verifyButtonEnabled } from '../utils/button';
import { DidMethod, KeyType, URLOption, VerificationProtocol } from '../utils/enums';
import { DEFAULT_WAIT_TIME, LONG_WAIT_TIME, RSEConfig } from '../utils/init';
import { scanURL } from '../utils/scan';

interface ProofSharingProops {
  beforeQRCodeScanning?: (
    proofRequestId: string,
    invitationUrl: string,
  ) => Promise<void>;
  customShareDataScreenTest?: (proofRequestId: string) => Promise<void>;
  didId?: string;
  didMethod?: DidMethod;
  exchange?: VerificationProtocol;
  keyAlgorithms?: KeyType | KeyType[];
  proofSchemaId: string;
  proofSharingUrlType?: URLOption;
  redirectUri?: string;
  rseConfig?: RSEConfig;
  selectiveDisclosureCredentials?: string[];
  verifier?: string;
}

interface ProofRequestProps {
  action?: ProofAction;
  data: ProofSharingProops;
  expectConnectionError?: boolean;
  expectedResult?: LoaderViewState;
}

export enum ProofAction {
  REJECT = 'reject',
  SHARE = 'share',
  SHARE_BLOCKED = 'share-blocked',
}

export const shareCredential = async (
  expectedResult: LoaderViewState,
  data: ProofSharingProops,
) => {
  await expect(ProofRequestSharingScreen.screen).toBeVisible(1);
  await ProofRequestSharingScreen.scrollTo(
    ProofRequestSharingScreen.shareButton,
  );
  await device.disableSynchronization();

  await ProofRequestSharingScreen.shareButton.tap();

  if (data.rseConfig?.isRSEOnboarded) {
    if (data.rseConfig.signCertCount) {
      let count = 0;
      while (count < data.rseConfig.signCertCount) {
        await RemoteSecureElementSignScreen.waitForScreenDisplayedAndFillPINCode(
          data.rseConfig.PINCode,
        );
        await waitForElementIsNotPresent(
          RemoteSecureElementSignScreen.screen,
          DEFAULT_WAIT_TIME,
        );
        count++;
      }
    } else {
      await RemoteSecureElementSignScreen.waitForScreenDisplayedAndFillPINCode(
        data.rseConfig.PINCode,
      );
    }
  }

  await waitFor(ProofRequestAcceptProcessScreen.screen)
    .toBeVisible(1)
    .withTimeout(2000);

  if (expectedResult === LoaderViewState.Success) {
    await waitFor(ProofRequestAcceptProcessScreen.status.success)
      .toBeVisible()
      .withTimeout(LONG_WAIT_TIME);
    if (data.redirectUri) {
      await waitFor(ProofRequestAcceptProcessScreen.button.redirect)
        .toBeVisible()
        .withTimeout(500);
      return;
    } else {
      await expect(ProofRequestAcceptProcessScreen.button.close).toBeVisible();
    }
  } else if (expectedResult === LoaderViewState.Warning) {
    await waitFor(ProofRequestAcceptProcessScreen.status.warning)
      .toBeVisible()
      .withTimeout(4000);
  }
  await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible(1);

  await ProofRequestAcceptProcessScreen.closeButton.tap();
  await device.enableSynchronization();

  await waitForElementVisible(WalletScreen.screen, DEFAULT_WAIT_TIME, 1);
};

export const requestProofAndReviewProofRequestSharingScreen = async (
  authToken: string,
  data: ProofSharingProops,
) => {
  const proofRequestData = {
    exchange: data.exchange,
    proofSchemaId: data.proofSchemaId,
    redirectUri: data.redirectUri,
  };
  if(data?.verifier){
    Object.assign(proofRequestData, { verifier: data.verifier });  
  }
  if(data?.didId){
    Object.assign(proofRequestData, { verifierDid: data?.didId, }); 
  }
  if(data?.didMethod && data?.keyAlgorithms){
    const did = await getLocalDid(authToken, {
      didMethods: data.didMethod,
      keyAlgorithms: data.keyAlgorithms,
    });
    Object.assign(proofRequestData, { verifierDid: did.id, });
  }
  const proofRequestId = await createProofRequest(authToken, proofRequestData);
  const invitationUrls = await requestProof(proofRequestId, authToken);
  const invitationUrl =
    data.proofSharingUrlType === URLOption.UNIVERSAL_LINK
      ? invitationUrls.appUrl
      : invitationUrls.url;
  await data.beforeQRCodeScanning?.(proofRequestId, invitationUrl);
  await scanURL(invitationUrl);
  //await expect(InvitationProcessScreen.screen).toBeVisible(); // if the process is fast enough, there will be no invitation process screen, so this code is commented
  await waitForElementVisible(ProofRequestSharingScreen.screen, 6000, 1);
  return proofRequestId;
};

export const proofSharing = async (
  authToken: string,
  {
    action = ProofAction.SHARE,
    data,
    expectedResult = LoaderViewState.Success,
    expectConnectionError,
  }: ProofRequestProps,
) => {
  const proofRequestId = await requestProofAndReviewProofRequestSharingScreen(
    authToken,
    data,
  );

  if (expectConnectionError) {
    await waitForElementVisible(
      element(by.text('Connection failed')),
      DEFAULT_WAIT_TIME,
      1,
    );
    return;
  }
  const credential_0 = ProofRequestSharingScreen.credentialAtIndex(0);
  await waitForElementPresent(credential_0.element, LONG_WAIT_TIME);
  for (const [index] of data.selectiveDisclosureCredentials?.entries() || []) {
    const credential = ProofRequestSharingScreen.credentialAtIndex(index);
    await credential.selectiveDisclosureMessageVisible();
  }

  await data.customShareDataScreenTest?.(proofRequestId);

  if (action === ProofAction.REJECT) {
    await ProofRequestSharingScreen.cancelButton.tap();
    await expect(WalletScreen.screen).toBeVisible(1);
  } else if (action === ProofAction.SHARE) {
    await shareCredential(expectedResult, data);
  } else if (action === ProofAction.SHARE_BLOCKED) {
    await ProofRequestSharingScreen.scrollTo(
      ProofRequestSharingScreen.shareButton,
    );
    await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);
    await ProofRequestSharingScreen.cancelButton.tap();
    await expect(WalletScreen.screen).toBeVisible(1);
  }
};

export interface ProofSchemaDataProps {
  credentialSchemas: CredentialSchemaResponseDTO[];
  expireDuration?: number;
  name?: string;
  proofInputSchemas?: ProofInputSchemasRequestDTO[];
  validityConstraint?: number;
}
export const proofSchemaCreate = async (
  authToken: string,
  {
    credentialSchemas,
    expireDuration,
    name,
    proofInputSchemas,
    validityConstraint,
  }: ProofSchemaDataProps,
): Promise<ProofSchemaResponseDTO> => {
  const proofSchemas = credentialSchemas.map((credSchema) => ({
    claimSchemas: credSchema.claims.map((claim) => ({
      id: claim.id,
      required: claim.required,
    })),
    credentialSchemaId: credSchema.id,
    validityConstraint: validityConstraint,
  }));
  const proofSchemaData: CreateProofSchemaRequestDTO = {
    expireDuration: expireDuration || 0,
    name: name ?? `proof-schema-${uuidv4()}`,
    proofInputSchemas: proofInputSchemas ?? proofSchemas,
  };
  return createProofSchema(authToken, proofSchemaData);
};
