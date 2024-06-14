import { expect } from 'detox';
import { v4 as uuidv4 } from 'uuid';

import { credentialIssuance } from '../helpers/credential';
import { proofSchemaCreate, proofSharing } from '../helpers/proof-request';
import { LoaderViewState } from '../page-objects/components/LoadingResult';
import ProofRequestSharingScreen from '../page-objects/proof-request/ProofRequestSharingScreen';
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
} from '../utils/enums';
import { launchApp } from '../utils/init';

describe('ONE-614: Proof request', () => {
  let authToken: string;
  let mdocSchema: CredentialSchemaResponseDTO;
  let singleClaimMdocProofSchema: ProofSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();
    authToken = await bffLogin();

    mdocSchema = await createCredentialSchema(authToken, {
      claims: [
        {
          claims: [
            { datatype: DataType.STRING, key: 'country', required: true },
            { datatype: DataType.STRING, key: 'region', required: true },
            { datatype: DataType.STRING, key: 'city', required: true },
            { datatype: DataType.STRING, key: 'street', required: true },
          ],
          datatype: DataType.OBJECT,
          key: 'Address',
          required: true,
        },
        {
          claims: [
            { datatype: DataType.STRING, key: 'first name', required: true },
            { datatype: DataType.STRING, key: 'last name', required: true },
            { datatype: DataType.MDL_PICTURE, key: 'portrait', required: true },
            { datatype: DataType.BIRTH_DATE, key: 'birthdate', required: true },
          ],
          datatype: DataType.OBJECT,
          key: 'Credentials',
          required: true,
        },
      ],
      format: CredentialFormat.MDOC,
      name: `Driver Licence ${uuidv4()}`,
      revocationMethod: RevocationMethod.NONE,
      schemaId: `org.iso.18013.5.1.mDL-${uuidv4()}`,
    });

    singleClaimMdocProofSchema = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true }, // country
            { id: mdocSchema.claims[1].claims![0].id, required: true }, // first name
            { id: mdocSchema.claims[1].claims![2].id, required: true }, // portrait
          ],
          credentialSchemaId: mdocSchema.id,
        },
      ],
    });
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: mdocSchema,
      didMethods: DidMethod.MDL,
      exchange: Exchange.OPENID4VC,
      keyAlgorithms: KeyType.ES256,
    });
  });

  it('mDoc credential. Single credential with nested claims', async () => {
    const mdocCredentialTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      const credentialCard = ProofRequestSharingScreen.credential(0);
      await credentialCard.verifyIsVisible();
      await credentialCard.verifyCredentialName(mdocSchema.name);
      const claims = [
        { key: 'country', value: 'string' },
        { key: 'first name', value: 'string' },
        { image: true, key: 'portrait' },
      ];
      await credentialCard.verifyClaimValues(
        claims,
        ProofRequestSharingScreen.scrollTo,
      );
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialTest,
        exchange: Exchange.OPENID4VC,
        proofSchemaId: singleClaimMdocProofSchema.id,
      },
    });
  });

  it('mDoc with JWT', async () => {
    const diplomaJwtSchema = await createCredentialSchema(authToken, {
      claims: [
        {
          datatype: DataType.STRING,
          key: 'Faculty',
          required: true,
        },
        {
          datatype: DataType.STRING,
          key: 'Department',
          required: true,
        },
        {
          datatype: DataType.STRING,
          key: 'Education',
          required: true,
        },
      ],
      format: CredentialFormat.JWT,
      name: `University Diploma ${uuidv4()}`,
      revocationMethod: RevocationMethod.LVVC,
    });
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: diplomaJwtSchema,
      exchange: Exchange.OPENID4VC,
    });
    const jwtProofSchemaWithMdoc = await proofSchemaCreate(authToken, {
      credentialSchemas: [mdocSchema, diplomaJwtSchema],
      proofInputSchemas: [
        {
          claimSchemas: [
            { id: mdocSchema.claims[0].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![0].id, required: true },
            { id: mdocSchema.claims[1].claims![2].id, required: true },
          ],
          credentialSchemaId: mdocSchema.id,
        },
        {
          claimSchemas: [
            { id: diplomaJwtSchema.claims[0].id, required: true },
            { id: diplomaJwtSchema.claims[1].id, required: true },
            { id: diplomaJwtSchema.claims[2].id, required: true },
          ],
          credentialSchemaId: diplomaJwtSchema.id,
        },
      ],
    });

    const mdocCredentialSharingTest = async () => {
      await expect(ProofRequestSharingScreen.screen).toBeVisible();
      const credentialCard_1 = ProofRequestSharingScreen.credential(0);
      await credentialCard_1.verifyIsVisible();
      await credentialCard_1.verifyCredentialName(mdocSchema.name);
      await credentialCard_1.verifyIsCardCollapsed(false);
      await credentialCard_1.collapseOrExpand();
      await credentialCard_1.verifyIsCardCollapsed(true);

      const credentialCard_2 = ProofRequestSharingScreen.credential(1);
      await ProofRequestSharingScreen.scrollTo(credentialCard_2.element);
      await credentialCard_2.verifyIsVisible();
      await credentialCard_2.verifyCredentialName(diplomaJwtSchema.name);
      await credentialCard_2.verifyIsCardCollapsed(true);
      await credentialCard_2.selectiveDisclosureMessageVisible();
    };

    await proofSharing(authToken, {
      data: {
        customShareDataScreenTest: mdocCredentialSharingTest,
        exchange: Exchange.OPENID4VC,
        proofSchemaId: jwtProofSchemaWithMdoc.id,
      },
      // Curently not supported. Set up Warning
      expectedResult: LoaderViewState.Warning,
    });
  });
});
