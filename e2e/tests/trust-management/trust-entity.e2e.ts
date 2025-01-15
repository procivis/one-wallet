import { expect } from 'detox';

import {
  acceptCredentialTestCase,
  credentialIssuance,
  offerCredentialAndReviewCredentialOfferScreen,
} from '../../helpers/credential';
import {
  proofSchemaCreate,
  requestProofAndReviewProofRequestSharingScreen,
  shareCredential,
} from '../../helpers/proof-request';
import { LoaderViewState } from '../../page-objects/components/LoadingResult';
import CredentialDetailScreen, {
  Action,
} from '../../page-objects/credential/CredentialDetailScreen';
import CredentialNerdScreen from '../../page-objects/credential/CredentialNerdScreen';
import CredentialOfferScreen from '../../page-objects/CredentialOfferScreen';
import ProofRequestNerdScreen from '../../page-objects/proof-request/ProofRequestNerdScreen';
import ProofRequestSharingScreen from '../../page-objects/proof-request/ProofRequestSharingScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { DidDetailDTO } from '../../types/did';
import { ProofSchemaResponseDTO } from '../../types/proof';
import {
  bffLogin,
  createCredentialSchema,
  createDidWithKey,
  createTrustEntity,
  getTrustAnchor,
  getTrustEntityDetail,
  TrustEntityResponseDTO,
} from '../../utils/bff-api';
import { getTrustEntityRequestData } from '../../utils/data-utils';
import {
  CredentialFormat,
  DidMethod,
  Exchange,
  KeyType,
  RevocationMethod,
  TrustEntityRole,
} from '../../utils/enums';
import { launchApp } from '../../utils/init';

const issueCredentialWithDidTrustEntityAndVerify = async (
  authToken: string,
  credentialSchema: CredentialSchemaResponseDTO,
  issuerDid: DidDetailDTO,
  trustEntity?: TrustEntityResponseDTO,
) => {
  const data = {
    authToken: authToken,
    credentialSchema: credentialSchema,
    didData: issuerDid,
    exchange: Exchange.OPENID4VC,
  };
  const holderCredentialId =
    await offerCredentialAndReviewCredentialOfferScreen(data);
  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.ISSUER
    ) {
      await CredentialOfferScreen.trustEntity.verifyEntityDetailHeader(
        trustEntity,
      );
    } else {
      await CredentialOfferScreen.trustEntity.verifyEntityDetailHeaderDefault(
        trustEntity.did.did,
      );
    }
  } else {
    await CredentialOfferScreen.trustEntity.verifyEntityDetailHeaderDefault(
      issuerDid.did,
    );
  }
  await CredentialOfferScreen.infoButton.tap();
  await expect(CredentialNerdScreen.screen).toBeVisible();

  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.ISSUER
    ) {
      await CredentialNerdScreen.TrustEntityInfo.verifyTrustEntityDetail(
        trustEntity,
      );
    } else {
      await CredentialNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
        trustEntity.did.did,
      );
    }
  } else {
    await CredentialNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
      issuerDid.did,
    );
  }
  await CredentialNerdScreen.back.tap();
  await acceptCredentialTestCase(data, LoaderViewState.Success);
  await WalletScreen.openDetailScreenByCredentialId(holderCredentialId);
  await expect(CredentialDetailScreen.screen).toBeVisible();
  await CredentialDetailScreen.actionButton.tap();
  await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
  await expect(CredentialNerdScreen.screen).toBeVisible();

  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.ISSUER
    ) {
      await CredentialNerdScreen.TrustEntityInfo.verifyTrustEntityDetail(
        trustEntity,
      );
    } else {
      await CredentialNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
        trustEntity.did.did,
      );
    }
  } else {
    await CredentialNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
      issuerDid.did,
    );
  }
  await CredentialNerdScreen.back.tap();
};

const proofSharingWithDidTrustEntityAndVerify = async (
  authToken: string,
  proofSchemaId: string,
  verifierDid: DidDetailDTO,
  trustEntity?: TrustEntityResponseDTO,
) => {
  const proofRequestData = {
    didId: verifierDid.id,
    exchange: Exchange.OPENID4VC,
    proofSchemaId: proofSchemaId,
  };

  await requestProofAndReviewProofRequestSharingScreen(
    authToken,
    proofRequestData,
  );

  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.VERIFIER
    ) {
      await ProofRequestSharingScreen.trustEntity.verifyEntityDetailHeader(
        trustEntity,
      );
    } else {
      await ProofRequestSharingScreen.trustEntity.verifyEntityDetailHeaderDefault(
        trustEntity.did.did,
      );
    }

    await ProofRequestSharingScreen.scrollTo(
      ProofRequestSharingScreen.disclaimer,
    );
    if (trustEntity.termsUrl && trustEntity.privacyUrl) {
      await expect(ProofRequestSharingScreen.disclaimer).toHaveText(
        'By tapping on “share” you agree to the Terms of services and Privacy policy provided by this entity.',
      );
    } else if (trustEntity.termsUrl) {
      await expect(ProofRequestSharingScreen.disclaimer).toHaveText(
        'By tapping on “share” you agree to the Terms of services provided by this entity.',
      );
    } else if (trustEntity.privacyUrl) {
      await expect(ProofRequestSharingScreen.disclaimer).toHaveText(
        'By tapping on “share” you agree to the Privacy policy provided by this entity.',
      );
    } else {
      await expect(ProofRequestSharingScreen.disclaimer).toHaveText(
        'No terms of service or privacy policy provided.',
      );
    }
  } else {
    await ProofRequestSharingScreen.trustEntity.verifyEntityDetailHeaderDefault(
      verifierDid.did,
    );
  }
  await ProofRequestSharingScreen.infoButton.tap();
  await expect(ProofRequestNerdScreen.screen).toBeVisible();

  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.VERIFIER
    ) {
      await ProofRequestNerdScreen.TrustEntityInfo.verifyTrustEntityDetail(
        trustEntity,
      );
    } else {
      await ProofRequestNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
        trustEntity.did.did,
      );
    }
  } else {
    await ProofRequestNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
      verifierDid.did,
    );
  }
  await ProofRequestNerdScreen.close();
  await shareCredential(LoaderViewState.Success, proofRequestData);
};

// const verifyNewestProofRequestOnHistory = async (
//   verifierDid: DidDetailDTO,
//   trustEntity?: TrustEntityResponseDTO,
// ) => {
//   await expect(WalletScreen.screen).toBeVisible();
//   await WalletScreen.settingsButton.tap();
//   await expect(SettingsScreen.screen).toBeVisible();
//   await SettingsScreen.button(SettingsButton.HISTORY).tap();
//   await expect(HistoryScreen.screen).toBeVisible();

//   await HistoryScreen.history(0).element.tap();
//   await expect(HistoryDetailScreen.screen).toBeVisible();
//   await HistoryDetailScreen.infoButton.tap();
//   await expect(ProofRequestNerdScreen.screen).toBeVisible();

//   if (trustEntity) {
//     if (
//       trustEntity.role === TrustEntityRole.BOTH ||
//       trustEntity.role === TrustEntityRole.VERIFIER
//     ) {
//       await ProofRequestNerdScreen.TrustEntityInfo.verifyTrustEntityDetail(
//         trustEntity,
//       );
//     } else {
//       await ProofRequestNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
//         trustEntity.did.did,
//       );
//     }
//   } else {
//     await ProofRequestNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
//       verifierDid.did,
//     );
//   }
//   await ProofRequestNerdScreen.close();

//   await HistoryDetailScreen.back.tap();
//   await expect(SettingsScreen.screen).toBeVisible();
//   await SettingsScreen.back.tap();
//   await expect(WalletScreen.screen).toBeVisible();
// };

describe('Credential issuance with trust entity', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();
    authToken = await bffLogin();
  });

  describe('Issue credentials with trust entity', () => {
    let credentialSchemaSD_JWT: CredentialSchemaResponseDTO;
    let credentialSchemaJWT: CredentialSchemaResponseDTO;
    let proofSchema: ProofSchemaResponseDTO;
    let combinedProofSchema: ProofSchemaResponseDTO;
    let issuerTrustEntity: TrustEntityResponseDTO;
    let verifierTrustEntity: TrustEntityResponseDTO;
    let bothRoleTrustEntity: TrustEntityResponseDTO;
    let didNotInTrustAnchor: DidDetailDTO;
    beforeAll(async () => {
      credentialSchemaSD_JWT = await createCredentialSchema(authToken, {
        format: CredentialFormat.SD_JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
      });
      credentialSchemaJWT = await createCredentialSchema(authToken, {
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
      });
      proofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchemaSD_JWT],
      });
      combinedProofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchemaSD_JWT, credentialSchemaJWT],
      });
      const issuerDid = await createDidWithKey(authToken, {
        didMethod: DidMethod.KEY,
        keyType: KeyType.ES256,
      });
      const trustAnchor = await getTrustAnchor(authToken);
      const issuerTrustEntityId = await createTrustEntity(
        authToken,
        getTrustEntityRequestData(
          issuerDid.id,
          trustAnchor.id,
          TrustEntityRole.ISSUER,
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
          'https://www.procivis.ch/en/privacy-policy',
          'https://www.procivis.ch/en/legal/terms-of-service-procivis-one-trial-environment',
          'https://www.procivis.ch/en',
        ),
      );
      issuerTrustEntity = await getTrustEntityDetail(
        issuerTrustEntityId,
        authToken,
      );
      const verifierDid = await createDidWithKey(authToken, {
        didMethod: DidMethod.WEB,
        keyType: KeyType.EDDSA,
      });

      const verifierTrustEntityId = await createTrustEntity(
        authToken,
        getTrustEntityRequestData(
          verifierDid.id,
          trustAnchor.id,
          TrustEntityRole.VERIFIER,
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
          'https://www.procivis.ch/en/privacy-policy',
          'https://www.procivis.ch/en/legal/terms-of-service-procivis-one-trial-environment',
          'https://www.procivis.ch/en',
        ),
      );
      verifierTrustEntity = await getTrustEntityDetail(
        verifierTrustEntityId,
        authToken,
      );

      const bothRoleDid = await createDidWithKey(authToken, {
        didMethod: DidMethod.JWK,
        keyType: KeyType.DILITHIUM,
      });

      const bothRoleTrustEntityId = await createTrustEntity(
        authToken,
        getTrustEntityRequestData(
          bothRoleDid.id,
          trustAnchor.id,
          TrustEntityRole.BOTH,
        ),
      );
      bothRoleTrustEntity = await getTrustEntityDetail(
        bothRoleTrustEntityId,
        authToken,
      );

      didNotInTrustAnchor = await createDidWithKey(authToken, {
        didMethod: DidMethod.WEB,
        keyType: KeyType.ES256,
      });
    });

    it('Issue credential with trusted issuer did', async () => {
      await issueCredentialWithDidTrustEntityAndVerify(
        authToken,
        credentialSchemaSD_JWT,
        issuerTrustEntity.did,
        issuerTrustEntity,
      );
      await issueCredentialWithDidTrustEntityAndVerify(
        authToken,
        credentialSchemaSD_JWT,
        bothRoleTrustEntity.did,
        bothRoleTrustEntity,
      );
    });

    it('Issue credential with untrusted issuer did', async () => {
      await issueCredentialWithDidTrustEntityAndVerify(
        authToken,
        credentialSchemaSD_JWT,
        verifierTrustEntity.did,
        verifierTrustEntity,
      );
    });

    it('proof request', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSD_JWT,
        didData: didNotInTrustAnchor,
        exchange: Exchange.OPENID4VC,
      });

      await proofSharingWithDidTrustEntityAndVerify(
        authToken,
        proofSchema.id,
        verifierTrustEntity.did,
        verifierTrustEntity,
      );

      await proofSharingWithDidTrustEntityAndVerify(
        authToken,
        proofSchema.id,
        bothRoleTrustEntity.did,
        bothRoleTrustEntity,
      );

      await proofSharingWithDidTrustEntityAndVerify(
        authToken,
        proofSchema.id,
        issuerTrustEntity.did,
        issuerTrustEntity,
      );

      await proofSharingWithDidTrustEntityAndVerify(
        authToken,
        proofSchema.id,
        didNotInTrustAnchor,
      );
    });

    it('Combined proof request', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        didData: issuerTrustEntity.did,
        exchange: Exchange.OPENID4VC,
      });
      await issueCredentialWithDidTrustEntityAndVerify(
        authToken,
        credentialSchemaSD_JWT,
        didNotInTrustAnchor,
      );

      await proofSharingWithDidTrustEntityAndVerify(
        authToken,
        combinedProofSchema.id,
        bothRoleTrustEntity.did,
        bothRoleTrustEntity,
      );
    });
  });
});
