import {
  IdentifierDetailResponseDTO,
  TrustEntityType,
} from '@procivis/one-tests-lib';
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
import CredentialOfferNerdScreen from '../../page-objects/credential/CredentialOfferNerdScreen';
import CredentialOfferScreen from '../../page-objects/CredentialOfferScreen';
import HistoryDetailScreen from '../../page-objects/HistoryDetailScreen';
import HistoryScreen from '../../page-objects/HistoryScreen';
import ProofRequestNerdScreen from '../../page-objects/proof-request/ProofRequestNerdScreen';
import ProofRequestSharingNerdScreen from '../../page-objects/proof-request/ProofRequestSharingNerdScreen';
import ProofRequestSharingScreen from '../../page-objects/proof-request/ProofRequestSharingScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import { TrustEntityDetail } from '../../page-objects/trust-entity';
import TrustEntityHeader from '../../page-objects/trust-entity/TrustEntityHeader';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { DidDetailDTO } from '../../types/did';
import { ProofSchemaResponseDTO } from '../../types/proof';
import { TrustEntityResponseDTO } from '../../types/trustEntity';
import {
  createCertificateIdentifier,
  createCredentialSchema,
  createDidWithKey,
  createTrustEntity,
  getTrustAnchor,
  getTrustEntityDetail,
  keycloakAuth,
  resolveTrustEntity,
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

const verifyTermOfServiceAndPrivacyPolicy = async (
  disclaimer: Detox.IndexableNativeElement,
  trustEntity: TrustEntityResponseDTO,
  buttonName: string,
) => {
  if (trustEntity.termsUrl && trustEntity.privacyUrl) {
    await waitFor(disclaimer)
      .toHaveText(
        `By tapping on “${buttonName}” you agree to the Terms of services and Privacy policy provided by this entity.`,
      )
      .withTimeout(6000);
  } else if (trustEntity.termsUrl) {
    await waitFor(disclaimer)
      .toHaveText(
        `By tapping on “${buttonName}” you agree to the Terms of services provided by this entity.`,
      )
      .withTimeout(4000);
  } else if (trustEntity.privacyUrl) {
    await expect(disclaimer).toHaveText(
      `By tapping on “${buttonName}” you agree to the Privacy policy provided by this entity.`,
    );
  } else {
    await expect(disclaimer).toHaveText(
      `No terms of service or privacy policy provided.`,
    );
  }
};

const verifyTrustEntityHeaderVisibilityByRole = async (
  trustEntityHeader: TrustEntityHeader,
  trustEntity: TrustEntityResponseDTO,
  trustRoles: TrustEntityRole[],
  certificateCommonName?: string,
) => {
  if (trustRoles.includes(trustEntity.role)) {
    if (trustEntity.type === TrustEntityType.CA) {
      await trustEntityHeader.verifyEntityDetailHeader({
        entityName: certificateCommonName,
        logo: true,
      });
    } else {
      await trustEntityHeader.verifyEntityDetailHeader({
        entityName: trustEntity.name,
        logo: true,
      });
    }
  } else {
    await trustEntityHeader.verifyEntityDetailHeader({
      entityName: trustEntity.name,
      iconStatus: 'notTrusted',
    });
  }
};

const verifyTrustEntityDetailVisibilityByRole = async (
  trustEntityHeader: TrustEntityHeader,
  trustEntityDetail: TrustEntityDetail,
  trustEntity: TrustEntityResponseDTO,
  trustRoles: TrustEntityRole[],
  certificateCommonName?: string,
) => {
  await verifyTrustEntityHeaderVisibilityByRole(
    trustEntityHeader,
    trustEntity,
    trustRoles,
    certificateCommonName,
  );
  if (trustRoles.includes(trustEntity.role)) {
    await trustEntityDetail.verifyTrustEntityDetail(trustEntity);
  }
};

const issueCredentialWithIdentififierTrustEntityAndVerify = async ({
  authToken,
  credentialSchema,
  issuerDid,
  issuer,
  trustEntity,
}: {
  authToken: string;
  credentialSchema: CredentialSchemaResponseDTO;
  issuer?: IdentifierDetailResponseDTO;
  issuerDid?: DidDetailDTO;
  trustEntity?: TrustEntityResponseDTO;
}): Promise<string> => {
  const data = {
    authToken: authToken,
    credentialSchema: credentialSchema,
    didData: issuerDid,
    exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    issuer: issuer,
  };
  const issuerHolderCredentialIds =
    await offerCredentialAndReviewCredentialOfferScreen(data);
  if (trustEntity) {
    await verifyTrustEntityHeaderVisibilityByRole(
      CredentialOfferScreen.trustEntity,
      trustEntity,
      [TrustEntityRole.BOTH, TrustEntityRole.ISSUER],
      issuer?.certificates?.at(0)?.name,
    );
    await CredentialOfferScreen.scrollTo(CredentialOfferScreen.disclaimer);
    await verifyTermOfServiceAndPrivacyPolicy(
      CredentialOfferScreen.disclaimer,
      trustEntity,
      'accept',
    );
  } else {
    await CredentialOfferScreen.trustEntity.verifyEntityDetailHeader({
      didName: issuerDid?.did,
      iconStatus: 'notTrusted',
    });
    await expect(CredentialOfferScreen.disclaimer).toHaveText(
      'No terms of service or privacy policy provided.',
    );
  }
  await CredentialOfferScreen.infoButton.tap();
  await expect(CredentialOfferNerdScreen.screen).toBeVisible(1);
  if (trustEntity) {
    await verifyTrustEntityDetailVisibilityByRole(
      CredentialOfferNerdScreen.entityCluster.header,
      CredentialOfferNerdScreen.entityCluster.detail,
      trustEntity,
      [TrustEntityRole.BOTH, TrustEntityRole.ISSUER],
      issuer?.certificates?.at(0)?.name,
    );
  } else {
    await CredentialOfferNerdScreen.entityCluster.header.verifyEntityDetailHeader(
      {
        didName: issuerDid?.did,
        iconStatus: 'notTrusted',
      },
    );
  }
  await CredentialOfferNerdScreen.back.tap();
  await acceptCredentialTestCase(data, LoaderViewState.Success);
  await WalletScreen.openDetailScreenByCredentialId(
    issuerHolderCredentialIds.holderCredentialId,
  );
  await CredentialDetailScreen.screen.waitForScreenVisible();
  await CredentialDetailScreen.actionButton.tap();
  await CredentialDetailScreen.action(Action.MORE_INFORMATION).tap();
  await expect(CredentialNerdScreen.screen).toBeVisible(1);

  if (trustEntity) {
    await verifyTrustEntityDetailVisibilityByRole(
      CredentialNerdScreen.entityCluster.header,
      CredentialNerdScreen.entityCluster.detail,
      trustEntity,
      [TrustEntityRole.BOTH, TrustEntityRole.ISSUER],
      issuer?.certificates?.at(0)?.name,
    );
  } else {
    await CredentialNerdScreen.entityCluster.header.verifyEntityDetailHeader({
      didName: issuerDid?.did,
      iconStatus: 'notTrusted',
    });
  }
  await CredentialNerdScreen.back.tap();

  return issuerHolderCredentialIds.holderCredentialId;
};

const proofSharingWithIdentifierTrustEntityAndVerify = async ({
  authToken,
  proofSchemaId,
  verifierDid,
  verifier,
  trustEntity,
}: {
  authToken: string;
  proofSchemaId: string;
  trustEntity?: TrustEntityResponseDTO;
  verifier?: IdentifierDetailResponseDTO;
  verifierDid?: DidDetailDTO;
}) => {
  const proofRequestData = {
    didId: verifierDid?.id,
    exchange: VerificationProtocol.OPENID4VP_DRAFT20,
    proofSchemaId: proofSchemaId,
    verifier: verifier?.id,
  };

  await requestProofAndReviewProofRequestSharingScreen(
    authToken,
    proofRequestData,
  );

  if (trustEntity) {
    await verifyTrustEntityHeaderVisibilityByRole(
      ProofRequestSharingScreen.trustEntity,
      trustEntity,
      [TrustEntityRole.BOTH, TrustEntityRole.VERIFIER],
      verifier?.certificates?.at(0)?.name,
    );
    await ProofRequestSharingScreen.scrollTo(
      ProofRequestSharingScreen.disclaimer,
    );

    await verifyTermOfServiceAndPrivacyPolicy(
      ProofRequestSharingScreen.disclaimer,
      trustEntity,
      'share',
    );
  } else {
    await ProofRequestSharingScreen.trustEntity.verifyEntityDetailHeader({
      didName: verifierDid?.did,
      iconStatus: 'notTrusted',
    });
  }
  await ProofRequestSharingScreen.infoButton.tap();
  await expect(ProofRequestSharingNerdScreen.screen).toBeVisible(1);

  if (trustEntity) {
    await verifyTrustEntityDetailVisibilityByRole(
      ProofRequestSharingNerdScreen.entityCluster.header,
      ProofRequestSharingNerdScreen.entityCluster.detail,
      trustEntity,
      [TrustEntityRole.BOTH, TrustEntityRole.VERIFIER],
      verifier?.certificates?.at(0)?.name,
    );
  } else {
    await ProofRequestSharingNerdScreen.entityCluster.header.verifyEntityDetailHeader(
      {
        didName: verifierDid?.did,
        iconStatus: 'notTrusted',
      },
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

  await HistoryScreen.historyEntryList.historyRow(0).element.tap();
  await expect(HistoryDetailScreen.screen).toBeVisible(1);
  await HistoryDetailScreen.infoButton.tap();
  await expect(ProofRequestNerdScreen.screen).toBeVisible(1);

  if (trustEntity) {
    await verifyTrustEntityDetailVisibilityByRole(
      ProofRequestNerdScreen.entityCluster.header,
      ProofRequestNerdScreen.entityCluster.detail,
      trustEntity,
      [TrustEntityRole.BOTH, TrustEntityRole.VERIFIER],
    );
  } else {
    await ProofRequestNerdScreen.entityDetailHeader.verifyEntityDetailHeader({
      didName: verifierDid.did,
      iconStatus: 'notTrusted',
    });
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
        ).verifyEntityDetailHeader({
          entityName: credentialTrustEntity.trustEntity.name,
        });
      } else if (credentialTrustEntity.didDetail) {
        await ProofRequestNerdScreen.trustEntityByCredentialID(
          credentialTrustEntity.credentialId,
        ).verifyEntityDetailHeader({
          entityName: credentialTrustEntity.didDetail.did,
        });
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

describe('Trust entity', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();
  });

  describe('Did identifier trust entity', () => {
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
      [credentialSchemaSD_JWT, credentialSchemaJWT, credentialSchemaJSONLD] =
        await Promise.all([
          createCredentialSchema(
            authToken,
            getCredentialSchemaData({
              format: CredentialFormat.SD_JWT,
              revocationMethod: RevocationMethod.STATUSLIST2021,
            }),
          ),
          createCredentialSchema(
            authToken,
            getCredentialSchemaData({
              format: CredentialFormat.JWT,
              revocationMethod: RevocationMethod.STATUSLIST2021,
            }),
          ),
          createCredentialSchema(
            authToken,
            getCredentialSchemaData({
              format: CredentialFormat.JSON_LD_CLASSIC,
              revocationMethod: RevocationMethod.NONE,
            }),
          ),
        ]);
      [proofSchema, combinedProofSchema] = await Promise.all([
        proofSchemaCreate(authToken, {
          credentialSchemas: [credentialSchemaSD_JWT],
        }),
        proofSchemaCreate(authToken, {
          credentialSchemas: [credentialSchemaJWT, credentialSchemaJSONLD],
        }),
      ]);

      const issuerDid = await createDidWithKey(authToken, {
        didMethod: DidMethod.KEY,
        keyType: KeyType.ECDSA,
      });
      const trustAnchor = await getTrustAnchor(authToken);
      const issuerTrustEntityId = await createTrustEntity(
        authToken,
        getTrustEntityRequestData({
          didId: issuerDid.id,
          logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
          privacyUrl: 'https://www.procivis.ch/en/privacy-policy',
          role: TrustEntityRole.ISSUER,
          termsUrl:
            'https://www.procivis.ch/en/legal/terms-of-service-procivis-one-trial-environment',
          trustAnchorId: trustAnchor.id,
          website: 'https://www.procivis.ch/en',
        }),
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
        getTrustEntityRequestData({
          didId: verifierDid.id,
          logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
          privacyUrl: 'https://www.procivis.ch/en/privacy-policy',
          role: TrustEntityRole.VERIFIER,
          termsUrl:
            'https://www.procivis.ch/en/legal/terms-of-service-procivis-one-trial-environment',
          trustAnchorId: trustAnchor.id,
          website: 'https://www.procivis.ch/en',
        }),
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
        getTrustEntityRequestData({
          didId: bothRoleDid.id,
          role: TrustEntityRole.BOTH,
          trustAnchorId: trustAnchor.id,
        }),
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

    it('Issue credential with trusted issuer did role=issuer', async () => {
      await issueCredentialWithIdentififierTrustEntityAndVerify({
        authToken,
        credentialSchema: credentialSchemaSD_JWT,
        issuerDid: issuerTrustEntity.did,
        trustEntity: issuerTrustEntity,
      });
    });

    it('Issue credential with trusted issuer did role=both', async () => {
      await issueCredentialWithIdentififierTrustEntityAndVerify({
        authToken,
        credentialSchema: credentialSchemaSD_JWT,
        issuerDid: bothRoleTrustEntity.did,
        trustEntity: bothRoleTrustEntity,
      });
    });

    it('Issue credential with untrusted issuer did', async () => {
      await issueCredentialWithIdentififierTrustEntityAndVerify({
        authToken,
        credentialSchema: credentialSchemaSD_JWT,
        issuerDid: verifierTrustEntity.did,
        trustEntity: verifierTrustEntity,
      });
    });

    describe('request a proof with trust entity', () => {
      beforeAll(async () => {
        await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchemaSD_JWT,
          didData: didNotInTrustAnchor,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        });
      });
      it('Request a proof using trusted verifier did role=verifier', async () => {
        await proofSharingWithIdentifierTrustEntityAndVerify({
          authToken,
          proofSchemaId: proofSchema.id,
          trustEntity: verifierTrustEntity,
          verifierDid: verifierTrustEntity.did,
        });
      });

      it('Request a proof using trusted verifier did role=both', async () => {
        await proofSharingWithIdentifierTrustEntityAndVerify({
          authToken,
          proofSchemaId: proofSchema.id,
          trustEntity: bothRoleTrustEntity,
          verifierDid: bothRoleTrustEntity.did,
        });
      });

      it('Request a proof using trusted verifier did role=issuer', async () => {
        await proofSharingWithIdentifierTrustEntityAndVerify({
          authToken,
          proofSchemaId: proofSchema.id,
          trustEntity: issuerTrustEntity,
          verifierDid: issuerTrustEntity.did,
        });
      });

      it('Request a proof using untrusted verifier', async () => {
        await proofSharingWithIdentifierTrustEntityAndVerify({
          authToken,
          proofSchemaId: proofSchema.id,
          verifierDid: didNotInTrustAnchor,
        });
      });

      it('Combined proof request', async () => {
        const credentialWithTrustEntityIds = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchemaJWT,
          didData: issuerTrustEntity.did,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        });
        const credentialWithoutTrustEntityId =
          await issueCredentialWithIdentififierTrustEntityAndVerify({
            authToken,
            credentialSchema: credentialSchemaJSONLD,
            issuerDid: didNotInTrustAnchor,
          });

        await proofSharingWithIdentifierTrustEntityAndVerify({
          authToken,
          proofSchemaId: combinedProofSchema.id,
          trustEntity: bothRoleTrustEntity,
          verifierDid: bothRoleTrustEntity.did,
        });

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

  describe('Certificate identifier trust entity', () => {
    let credentialSchemaSDJWT_VC: CredentialSchemaResponseDTO;
    let proofSchema: ProofSchemaResponseDTO;
    let certificateIdentifierIssuer: IdentifierDetailResponseDTO;
    let caTrustEntity: TrustEntityResponseDTO;

    beforeAll(async () => {
      credentialSchemaSDJWT_VC = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.SD_JWT_VC,
          revocationMethod: RevocationMethod.TOKENSTATUSLIST,
        }),
      );
      proofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchemaSDJWT_VC],
      });

      certificateIdentifierIssuer = await createCertificateIdentifier(
        authToken,
        KeyType.EDDSA,
      );
      caTrustEntity = await resolveTrustEntity(
        {
          certificateId: certificateIdentifierIssuer.certificates?.at(0)?.id,
          id: certificateIdentifierIssuer.id,
        },
        authToken,
      );
      proofSchema = await proofSchemaCreate(authToken, {
        credentialSchemas: [credentialSchemaSDJWT_VC],
      });
    });

    it('Issue credential with trusted certificate identifier', async () => {
      await issueCredentialWithIdentififierTrustEntityAndVerify({
        authToken,
        credentialSchema: credentialSchemaSDJWT_VC,
        issuer: certificateIdentifierIssuer,
        trustEntity: caTrustEntity,
      });
    });

    it('Request a proof using trusted certificate identifier', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSDJWT_VC,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        issuer: certificateIdentifierIssuer,
      });

      await proofSharingWithIdentifierTrustEntityAndVerify({
        authToken,
        proofSchemaId: proofSchema.id,
        trustEntity: caTrustEntity,
        verifier: certificateIdentifierIssuer,
      });
    });
  });
});
