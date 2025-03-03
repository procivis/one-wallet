import { expect } from 'detox';

import { credentialIssuance } from '../helpers/credential';
import { getCredentialSchemaData } from '../helpers/credentialSchemas';
import {
  proofSchemaCreate,
  proofSharing,
  requestProofAndReviewProofRequestSharingScreen,
} from '../helpers/proof-request';
import {
  waitForElementToHaveText,
  waitForElementVisible,
} from '../page-objects/components/ElementUtil';
import RemoteSecureElementSignScreen from '../page-objects/credential/rse/RemoteSecureElementSignScreen';
import ProofRequestAcceptProcessScreen from '../page-objects/proof-request/ProofRequestAcceptProcessScreen';
import ProofRequestSharingScreen from '../page-objects/proof-request/ProofRequestSharingScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import { ProofSchemaResponseDTO } from '../types/proof';
import { bffLogin, createCredentialSchema } from '../utils/bff-api';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  Exchange,
  KeyType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';
import {
  DEFAULT_WAIT_TIME,
  launchApp,
  LONG_WAIT_TIME,
  SHORT_WAIT_TIME,
} from '../utils/init';

describe('RSE Ubiqu', () => {
  let authToken: string;
  let credentialSchemaRSE_JWT: CredentialSchemaResponseDTO;
  let credentialSchemaRSE_SDJWT: CredentialSchemaResponseDTO;
  let credentialSchemaRSE_JSONLD: CredentialSchemaResponseDTO;
  let credentialSchemaRSE_JSONLDBBS: CredentialSchemaResponseDTO;
  //let credentialSchemaRSE_SDJWTVC: CredentialSchemaResponseDTO;
  let credentialSchemaRSE_MDOC: CredentialSchemaResponseDTO;
  let proofSchema: ProofSchemaResponseDTO;
  let combinedProofSchema: ProofSchemaResponseDTO;
  beforeAll(async () => {
    await launchApp();
    authToken = await bffLogin();
    credentialSchemaRSE_JWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
        walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
      }),
    );
    credentialSchemaRSE_SDJWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.SD_JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
        walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
      }),
    );
    credentialSchemaRSE_JSONLD = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JSON_LD_CLASSIC,
        revocationMethod: RevocationMethod.LVVC,
        walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
      }),
    );

    credentialSchemaRSE_JSONLDBBS = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JSON_LD_BBSPLUS,
        revocationMethod: RevocationMethod.NONE,
        walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
      }),
    );

    // credentialSchemaRSE_SDJWTVC = await createCredentialSchema(
    //   authToken,
    //   getCredentialSchemaData({
    //     format: CredentialFormat.SD_JWT_VC,
    //     revocationMethod: RevocationMethod.NONE,
    //     walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
    //   }),
    // );

    credentialSchemaRSE_MDOC = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        claims: [
          {
            array: false,
            claims: [
              {
                array: false,
                datatype: DataType.STRING,
                key: 'country',
                required: true,
              },
            ],
            datatype: DataType.OBJECT,
            key: 'Address',
            required: true,
          },
        ],
        format: CredentialFormat.MDOC,
        revocationMethod: RevocationMethod.MDOC_MSO_UPDATE_SUSPENSION,
        walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
      }),
    );

    proofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [credentialSchemaRSE_SDJWT],
    });

    combinedProofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [
        credentialSchemaRSE_SDJWT,
        credentialSchemaRSE_JSONLD,
        credentialSchemaRSE_JWT,
        credentialSchemaRSE_JSONLDBBS,
        credentialSchemaRSE_MDOC,
      ],
      validityConstraint: 888,
    });
  });

  it('Accept credential with onboard RSE', async () => {
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: credentialSchemaRSE_JWT,
      exchange: Exchange.OPENID4VC,
      redirectUri: 'https://procivis.ch',
    });
  });

  describe('RSE is already onboarded', () => {
    const remotePINCode = '54321';
    beforeAll(async () => {
      await launchApp({ delete: true });
      authToken = await bffLogin();
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_SDJWT,
        exchange: Exchange.OPENID4VC,
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: false },
      });
    });

    it('Accept credential without onboard RSE', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_SDJWT,
        exchange: Exchange.OPENID4VC,
        redirectUri: 'https://procivis.ch',
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
      });
    });

    it('RSE is onboarded: Share RSE credential', async () => {
      await proofSharing(authToken, {
        data: {
          proofSchemaId: proofSchema.id,
          redirectUri: 'https://procivis.ch',
          rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
        },
      });
    });

    it('Share RSE credential: Input correct PIN Code after multiple attempt incorrect PIN Code', async () => {
      const data = {
        proofSchemaId: proofSchema.id,
        redirectUri: 'https://procivis.ch',
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
      };
      await requestProofAndReviewProofRequestSharingScreen(authToken, data);
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      await ProofRequestSharingScreen.scrollTo(
        ProofRequestSharingScreen.shareButton,
      );
      await device.disableSynchronization();

      await ProofRequestSharingScreen.shareButton.tap();

      await waitForElementVisible(
        RemoteSecureElementSignScreen.screen,
        LONG_WAIT_TIME,
      );
      if (data.rseConfig?.isRSEOnboarded) {
        let remainAttempts = 5;
        while (remainAttempts > 1) {
          const wrongPINCode = '11111';
          await RemoteSecureElementSignScreen.fillRemotePINCode(wrongPINCode);
          remainAttempts--;
          await waitForElementToHaveText(
            RemoteSecureElementSignScreen.error,
            `Wrong PIN entered (${remainAttempts} attempts left)`,
            SHORT_WAIT_TIME,
          );
        }
        await RemoteSecureElementSignScreen.fillRemotePINCode(
          data.rseConfig.PINCode,
        );
      }

      await waitForElementVisible(
        ProofRequestAcceptProcessScreen.status.success,
        DEFAULT_WAIT_TIME,
      );
      await expect(ProofRequestAcceptProcessScreen.screen).toBeVisible();

      await ProofRequestAcceptProcessScreen.closeButton.tap();
      await device.enableSynchronization();

      await expect(WalletScreen.screen).toBeVisible();
    });

    it('Share multiple RSE credential', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_JSONLD,
        exchange: Exchange.OPENID4VC,
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_JWT,
        exchange: Exchange.OPENID4VC,
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_JSONLDBBS,
        didFilter: {
          keyAlgorithms: KeyType.BBS_PLUS,
        },
        exchange: Exchange.OPENID4VC,
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_MDOC,
        didFilter: {
          didMethods: DidMethod.MDL,
          keyAlgorithms: KeyType.ES256,
        },
        exchange: Exchange.OPENID4VC,
        rseConfig: { PINCode: remotePINCode, isRSEOnboarded: true },
      });
      // Credential sharing page is keep loading if sdjwt vc is includeded
      // await credentialIssuance({
      //   authToken: authToken,
      //   credentialSchema: credentialSchemaRSE_SDJWTVC,
      //   exchange: Exchange.OPENID4VC,
      //   rseConfig: { isRSEOnboarded: true, PINCode: remotePINCode },
      // });

      await proofSharing(authToken, {
        data: {
          proofSchemaId: combinedProofSchema.id,
          rseConfig: {
            PINCode: remotePINCode,
            isRSEOnboarded: true,
            signCertCount: 2,
          },
        },
      });
    });
  });
});
