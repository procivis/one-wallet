import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { LoaderViewState } from '../page-objects/components/LoadingResult';
import InvitationProcessScreen from '../page-objects/InvitationProcessScreen';
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
} from '../utils/bff-api';
import { verifyButtonEnabled } from '../utils/button';
import { DidMethod, Exchange, KeyType, RevocationMethod } from '../utils/enums';
import { scanURL } from '../utils/scan';

interface ProofSharingProops {
  customShareDataScreenTest?: () => Promise<void>;
  didMethod?: DidMethod;
  exchange?: Exchange;
  keyAlgorithms?: KeyType | KeyType[];
  proofSchemaId: string;
  redirectUri?: string;
  selectiveDisclosureCredentials?: string[];
}

interface ProofRequestProps {
  action?: ProofAction;
  data: ProofSharingProops;
  expectedResult?: LoaderViewState;
}

export enum ProofAction {
  REJECT = 'reject',
  SHARE = 'share',
  SHARE_BLOCKED = 'share-blocked',
}

const shareCredential = async (
  expectedResult: LoaderViewState,
  data: ProofSharingProops,
) => {
  await expect(ProofRequestSharingScreen.screen).toBeVisible();
  await ProofRequestSharingScreen.scrollTo(
    ProofRequestSharingScreen.shareButton,
  );
  await device.disableSynchronization();

  await ProofRequestSharingScreen.shareButton.tap();
  await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();

  if (expectedResult === LoaderViewState.Success) {
    await waitFor(ProofRequestAcceptProcessScreen.status.success)
      .toBeVisible()
      .withTimeout(6000);
    if (data.redirectUri) {
      await waitFor(ProofRequestAcceptProcessScreen.button.redirect)
        .toBeVisible()
        .withTimeout(500);
    } else {
      await expect(ProofRequestAcceptProcessScreen.button.close).toBeVisible();
    }
  } else if (expectedResult === LoaderViewState.Warning) {
    await waitFor(ProofRequestAcceptProcessScreen.status.warning)
      .toBeVisible()
      .withTimeout(3000);
  }
  await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();

  await ProofRequestAcceptProcessScreen.closeButton.tap();
  await device.enableSynchronization();

  await expect(WalletScreen.screen).toBeVisible();
};

export const proofSharing = async (
  authToken: string,
  {
    action = ProofAction.SHARE,
    data,
    expectedResult = LoaderViewState.Success,
  }: ProofRequestProps,
) => {
  const did = await getLocalDid(authToken, {
    didMethods: data.didMethod,
    keyAlgorithms: data.keyAlgorithms,
  });
  const proofRequestId = await createProofRequest(authToken, {
    exchange: data.exchange,
    proofSchemaId: data.proofSchemaId,
    redirectUri: data.redirectUri,
    verifierDid: did.id,
  });
  const invitationUrl = await requestProof(proofRequestId, authToken);

  await scanURL(invitationUrl);
  await waitFor(InvitationProcessScreen.screen).toBeVisible();
  await waitFor(ProofRequestSharingScreen.screen).toBeVisible();
  for (const [index] of data.selectiveDisclosureCredentials?.entries() || []) {
    await ProofRequestSharingScreen.credential(
      index,
    ).selectiveDisclosureMessageVisible();
  }

  await data.customShareDataScreenTest?.();

  if (action === ProofAction.REJECT) {
    await ProofRequestSharingScreen.cancelButton.tap();
    await expect(WalletScreen.screen).toBeVisible();
  } else if (action === ProofAction.SHARE) {
    await shareCredential(expectedResult, data);
  } else if (action === ProofAction.SHARE_BLOCKED) {
    await ProofRequestSharingScreen.scrollTo(
      ProofRequestSharingScreen.shareButton,
    );
    await verifyButtonEnabled(ProofRequestSharingScreen.shareButton, false);
    await ProofRequestSharingScreen.cancelButton.tap();
    await expect(WalletScreen.screen).toBeVisible();
  }
};

export interface ProofSchemaDataProps {
  credentialSchemas: CredentialSchemaResponseDTO[];
  expireDuration?: number;
  name?: string;
  proofInputSchemas?: ProofInputSchemasRequestDTO[];
}
export const proofSchemaCreate = async (
  authToken: string,
  {
    credentialSchemas,
    expireDuration,
    name,
    proofInputSchemas,
  }: ProofSchemaDataProps,
): Promise<ProofSchemaResponseDTO> => {
  const proofSchemas = credentialSchemas.map((credSchema) => ({
    claimSchemas: credSchema.claims.map((claim) => ({
      id: claim.id,
      required: claim.required,
    })),
    credentialSchemaId: credSchema.id,
    validityConstraint:
      credSchema.revocationMethod === RevocationMethod.LVVC ? 10 : undefined,
  }));
  const proofSchemaData: CreateProofSchemaRequestDTO = {
    expireDuration: expireDuration || 0,
    name: name ?? `proof-schema-${uuidv4()}`,
    proofInputSchemas: proofInputSchemas ?? proofSchemas,
  };
  return createProofSchema(authToken, proofSchemaData);
};
