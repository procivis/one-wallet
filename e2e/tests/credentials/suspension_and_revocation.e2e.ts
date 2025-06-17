import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import { CredentialStatus } from '../../page-objects/components/CredentialCard';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import {
  createCredentialSchema,
  createDidWithKey,
  keycloakAuth,
  revokeCredential,
  suspendCredential,
} from '../../utils/api';
import {
  CredentialFormat,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../../utils/enums';
import { launchApp, reloadApp } from '../../utils/init';

const credentialFormatIssuance = (format: CredentialFormat) => {
  const exchange = IssuanceProtocol.OPENID4VCI_DRAFT13;
  let keyType = KeyType.ECDSA;
  let didMethod = DidMethod.KEY;

  switch (format) {
    case CredentialFormat.JWT:
      break;
    case CredentialFormat.SD_JWT:
      break;
    case CredentialFormat.SD_JWT_VC:
      break;
    case CredentialFormat.JSON_LD_BBSPLUS:
      keyType = KeyType.BBS_PLUS;
      break;
    case CredentialFormat.MDOC:
      keyType = KeyType.EDDSA;
      didMethod = DidMethod.MDL;
      break;
  }
  return { didMethod, exchange, keyType };
};

const SUPPORTED_BASE_FORMATS = {
  credentialFormat: [
    CredentialFormat.JWT,
    CredentialFormat.SD_JWT,
    CredentialFormat.JSON_LD_CLASSIC,
    CredentialFormat.JSON_LD_BBSPLUS,
  ],
  revocationMethod: [RevocationMethod.LVVC, RevocationMethod.STATUSLIST2021],
};

const COMBINATIONS_BASE = SUPPORTED_BASE_FORMATS.credentialFormat.flatMap(
  (credentialFormat) =>
    SUPPORTED_BASE_FORMATS.revocationMethod.flatMap((revocationMethod) => ({
      credentialFormat,
      revocationMethod,
    })),
);

const SUPPORTED_VC_FORMATS = {
  credentialFormat: [CredentialFormat.SD_JWT_VC],
  revocationMethod: [RevocationMethod.TOKENSTATUSLIST],
};

const COMBINATIONS_VC = SUPPORTED_VC_FORMATS.credentialFormat.flatMap(
  (credentialFormat) =>
    SUPPORTED_VC_FORMATS.revocationMethod.flatMap((revocationMethod) => ({
      credentialFormat,
      revocationMethod,
    })),
);

describe('ONE-620: Credential revocation', () => {
  let authToken: string;

  beforeAll(async () => {
    await launchApp();
    authToken = await keycloakAuth();
  });

  const testFormatRevocationMethod = (revocationMethod: RevocationMethod, credentialFormat: CredentialFormat) => {
    describe(`Revocation: ${revocationMethod}; Format: ${credentialFormat}`, () => {
      let credentialSchema: CredentialSchemaResponseDTO;
      let credentialId: string;

      beforeAll(async () => {
        await launchApp({ delete: true });
        credentialSchema = await createCredentialSchema(
          authToken,
          getCredentialSchemaData({
            allowSuspension: true,
            format: credentialFormat,
            revocationMethod,
            walletStorageType: WalletKeyStorageType.SOFTWARE,
          }),
        );
      });

      beforeEach(async () => {
        const { exchange, keyType, didMethod } =
          credentialFormatIssuance(credentialFormat);
        const didData = await createDidWithKey(authToken, {
          didMethod,
          keyType,
        });
        const issuerHolderCredentialIds = await credentialIssuance({
          authToken,
          credentialSchema,
          didData,
          exchange,
        });
        credentialId = issuerHolderCredentialIds.issuerCredentialId;
      });

      it('Suspend credential', async () => {
        await suspendCredential(credentialId, authToken);
        await reloadApp({
          credentialUpdate: [
            {
              expectedLabel: 'Suspended',
              index: 0,
              status: CredentialStatus.SUSPENDED,
            },
          ],
        });
      });

      it('Revoke credential', async () => {
        await revokeCredential(credentialId, authToken);
        await reloadApp({
          credentialUpdate: [
            {
              expectedLabel: 'Revoked',
              index: 0,
              status: CredentialStatus.REVOKED,
            },
          ],
        });
      });
    });
  }

  for (const { revocationMethod, credentialFormat } of COMBINATIONS_BASE) {
    testFormatRevocationMethod(revocationMethod, credentialFormat);
  }

  for (const { revocationMethod, credentialFormat } of COMBINATIONS_VC) {
    testFormatRevocationMethod(revocationMethod, credentialFormat);
  }
});
