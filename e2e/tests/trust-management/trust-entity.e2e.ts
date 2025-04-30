import { expect } from 'detox';

import {
  acceptCredentialTestCase,
  credentialIssuance,
  offerCredentialAndReviewCredentialOfferScreen,
} from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
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
import HistoryDetailScreen from '../../page-objects/HistoryDetailScreen';
import HistoryScreen from '../../page-objects/HistoryScreen';
import ProofRequestNerdScreen from '../../page-objects/proof-request/ProofRequestNerdScreen';
import ProofRequestSharingNerdScreen from '../../page-objects/proof-request/ProofRequestSharingNerdScreen';
import ProofRequestSharingScreen from '../../page-objects/proof-request/ProofRequestSharingScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { DidDetailDTO } from '../../types/did';
import { ProofSchemaResponseDTO } from '../../types/proof';
import { TrustEntityResponseDTO } from '../../types/trustEntity';
import {
  keycloakAuth,
  createCredentialSchema,
  createDidWithKey,
  createTrustEntity,
  getTrustAnchor,
  getTrustEntityDetail,
} from '../../utils/api';
import { getTrustEntityRequestData } from '../../utils/data-utils';
import {
  CredentialFormat,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
  TrustEntityRole,
  VerificationProtocol,
} from '../../utils/enums';
import { launchApp } from '../../utils/init';

interface CredentialTrustEntityInfo {
  credentialId: string;
  didDetail?: DidDetailDTO;
  isTrustedEntity: boolean;
  trustEntity?: TrustEntityResponseDTO;
}

const issueCredentialWithDidTrustEntityAndVerify = async (
  authToken: string,
  credentialSchema: CredentialSchemaResponseDTO,
  issuerDid: DidDetailDTO,
  trustEntity?: TrustEntityResponseDTO,
): Promise<string> => {
  const data = {
    authToken: authToken,
    credentialSchema: credentialSchema,
    didData: issuerDid,
    exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
  };
  const issuerHolderCredentialIds =
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
    await CredentialOfferScreen.scrollTo(CredentialOfferScreen.disclaimer);
    if (trustEntity.termsUrl && trustEntity.privacyUrl) {
      await waitFor(CredentialOfferScreen.disclaimer).toHaveText(
        'By tapping on “accept” you agree to the Terms of services and Privacy policy provided by this entity.',
      ).withTimeout(4000);
    } else if (trustEntity.termsUrl) {
      await waitFor(CredentialOfferScreen.disclaimer).toHaveText(
        'By tapping on “accept” you agree to the Terms of services provided by this entity.',
      ).withTimeout(4000);
    } else if (trustEntity.privacyUrl) {
      await expect(CredentialOfferScreen.disclaimer).toHaveText(
        'By tapping on “accept” you agree to the Privacy policy provided by this entity.',
      );
    } else {
      await expect(CredentialOfferScreen.disclaimer).toHaveText(
        'No terms of service or privacy policy provided.',
      );
    }
  } else {
    await CredentialOfferScreen.trustEntity.verifyEntityDetailHeaderDefault(
      issuerDid.did,
    );
    await expect(CredentialOfferScreen.disclaimer).toHaveText(
      'No terms of service or privacy policy provided.',
    );
  }
  await CredentialOfferScreen.infoButton.tap();
  await expect(CredentialNerdScreen.screen).toBeVisible(1);
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
  await WalletScreen.openDetailScreenByCredentialId(
    issuerHolderCredentialIds.holderCredentialId,
  );
  await expect(CredentialDetailScreen.screen).toBeVisible(1);
  await CredentialDetailScreen.actionButton.tap();
  await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
  await expect(CredentialNerdScreen.screen).toBeVisible(1);

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

  return issuerHolderCredentialIds.holderCredentialId;
};

const proofSharingWithDidTrustEntityAndVerify = async (
  authToken: string,
  proofSchemaId: string,
  verifierDid: DidDetailDTO,
  trustEntity?: TrustEntityResponseDTO,
) => {
  const proofRequestData = {
    didId: verifierDid.id,
    exchange: VerificationProtocol.OPENID4VP_DRAFT20,
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
  await expect(ProofRequestSharingNerdScreen.screen).toBeVisible(1);

  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.VERIFIER
    ) {
      await ProofRequestSharingNerdScreen.TrustEntityInfo.verifyTrustEntityDetail(
        trustEntity,
      );
    } else {
      await ProofRequestSharingNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
        trustEntity.did.did,
      );
    }
  } else {
    await ProofRequestSharingNerdScreen.TrustEntityInfo.verifyTrustEntityDetailDefault(
      verifierDid.did,
    );
  }
  await ProofRequestSharingNerdScreen.close();
  await shareCredential(LoaderViewState.Success, proofRequestData);
};

const verifyNewestProofRequestOnHistory = async (
  verifierDid: DidDetailDTO,
  trustEntity?: TrustEntityResponseDTO,
  credentialTrustEntityList?: CredentialTrustEntityInfo[],
) => {
  await expect(WalletScreen.screen).toBeVisible(1);
  await WalletScreen.settingsButton.tap();
  await expect(SettingsScreen.screen).toBeVisible(1);
  await SettingsScreen.button(SettingsButton.HISTORY).tap();
  await expect(HistoryScreen.screen).toBeVisible(1);

  await HistoryScreen.history(0).element.tap();
  await expect(HistoryDetailScreen.screen).toBeVisible(1);
  await HistoryDetailScreen.infoButton.tap();
  await expect(ProofRequestNerdScreen.screen).toBeVisible(1);

  if (trustEntity) {
    if (
      trustEntity.role === TrustEntityRole.BOTH ||
      trustEntity.role === TrustEntityRole.VERIFIER
    ) {
      await ProofRequestNerdScreen.entityDetailHeader.verifyEntityDetailHeader(
        trustEntity,
      );
    } else {
      await ProofRequestNerdScreen.entityDetailHeader.verifyEntityDetailHeaderDefault(
        trustEntity.did.did,
      );
    }
  } else {
    await ProofRequestNerdScreen.entityDetailHeader.verifyEntityDetailHeaderDefault(
      verifierDid.did,
    );
  }

  if (credentialTrustEntityList) {
    for (const credentialTrustEntity of credentialTrustEntityList) {
      await ProofRequestNerdScreen.scrollToCredentialView(
        credentialTrustEntity.credentialId,
      );
      if (
        credentialTrustEntity.isTrustedEntity &&
        credentialTrustEntity.trustEntity
      ) {
        await ProofRequestNerdScreen.trustEntityByCredentialID(
          credentialTrustEntity.credentialId,
        ).verifyEntityDetailHeader(credentialTrustEntity.trustEntity);
      } else if (credentialTrustEntity.didDetail) {
        await ProofRequestNerdScreen.trustEntityByCredentialID(
          credentialTrustEntity.credentialId,
        ).verifyEntityDetailHeaderDefault(credentialTrustEntity.didDetail.did);
      }
    }
  }

  await ProofRequestNerdScreen.close();
  await expect(HistoryDetailScreen.screen).toBeVisible(1);
  await HistoryDetailScreen.back.tap();
  await expect(HistoryScreen.screen).toBeVisible(1);
  await HistoryScreen.back.tap();
  await expect(SettingsScreen.screen).toBeVisible(1);
  await SettingsScreen.back.tap();
  await expect(WalletScreen.screen).toBeVisible(1);
};

describe('Credential issuance with trust entity', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();
  });

  describe('Issue credentials with trust entity', () => {
    let credentialSchemaSD_JWT: CredentialSchemaResponseDTO;
    let credentialSchemaJWT: CredentialSchemaResponseDTO;
    let credentialSchemaJSONLD: CredentialSchemaResponseDTO;
    let proofSchema: ProofSchemaResponseDTO;
    let combinedProofSchema: ProofSchemaResponseDTO;
    let issuerTrustEntity: TrustEntityResponseDTO;
    let verifierTrustEntity: TrustEntityResponseDTO;
    let bothRoleTrustEntity: TrustEntityResponseDTO;
    let didNotInTrustAnchor: DidDetailDTO;

    beforeAll(async () => {
      credentialSchemaSD_JWT = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.SD_JWT,
          revocationMethod: RevocationMethod.STATUSLIST2021,
        }),
      );
      credentialSchemaJWT = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.JWT,
          revocationMethod: RevocationMethod.STATUSLIST2021,
        }),
      );
      credentialSchemaJSONLD = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.JSON_LD_CLASSIC,
          revocationMethod: RevocationMethod.NONE,
        }),
      );
      proofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchemaSD_JWT],
      });
      combinedProofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchemaJWT, credentialSchemaJSONLD],
      });
      const issuerDid = await createDidWithKey(authToken, {
        didMethod: DidMethod.KEY,
        keyType: KeyType.ECDSA,
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
        keyType: KeyType.ECDSA,
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
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
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
      const credentialWithTrustEntityIds = await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        didData: issuerTrustEntity.did,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      const credentialWithoutTrustEntityId =
        await issueCredentialWithDidTrustEntityAndVerify(
          authToken,
          credentialSchemaJSONLD,
          didNotInTrustAnchor,
        );

      await proofSharingWithDidTrustEntityAndVerify(
        authToken,
        combinedProofSchema.id,
        bothRoleTrustEntity.did,
        bothRoleTrustEntity,
      );

      await verifyNewestProofRequestOnHistory(
        bothRoleTrustEntity.did,
        bothRoleTrustEntity,
        [
          {
            credentialId: credentialWithTrustEntityIds.holderCredentialId,
            isTrustedEntity: true,
            trustEntity: issuerTrustEntity,
          },
          {
            credentialId: credentialWithoutTrustEntityId,
            didDetail: didNotInTrustAnchor,
            isTrustedEntity: false,
          },
        ],
      );
    });
  });
});
