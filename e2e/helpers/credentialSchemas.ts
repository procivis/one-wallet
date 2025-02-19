import {
  CredentialClaimSchemaRequestDTO,
  CredentialSchemaData,
  LayoutProperties,
} from '../types/credentialSchema';
import { createCredentialSchema } from '../utils/bff-api';
import {
  CodeType,
  CredentialFormat,
  DataType,
  LayoutType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';
import { shortUUID } from '../utils/utils';
import { getObjectClaim, getSimpleClaims } from './claims';

function getCredentialSchemaName(
  format: CredentialFormat,
  revocationMethod: RevocationMethod,
  walletStorageType: WalletKeyStorageType,
) {
  return `${format}-${revocationMethod}-${walletStorageType}`;
}

export const mDocCredentialSchema = async (
  authToken: string,
  revocationMethod: RevocationMethod = RevocationMethod.NONE,
) => {
  const uuid = shortUUID();
  const claims = [
    {
      array: false,
      claims: [
        {
          array: false,
          datatype: DataType.STRING,
          key: 'country',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'region',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'city',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'street',
          required: true,
        },
      ],
      datatype: DataType.OBJECT,
      key: 'Address',
      required: true,
    },
    {
      array: false,
      claims: [
        {
          array: false,
          datatype: DataType.STRING,
          key: 'first name',
          required: true,
        },
        {
          array: false,
          datatype: DataType.STRING,
          key: 'last name',
          required: true,
        },
        {
          array: false,
          datatype: DataType.BIRTH_DATE,
          key: 'Birthday',
          required: true,
        },
        {
          array: false,
          datatype: DataType.MDL_PICTURE,
          key: 'image',
          required: true,
        },
      ],
      datatype: DataType.OBJECT,
      key: 'Credentials',
      required: true,
    },
    {
      array: false,
      claims: [
        {
          array: true,
          claims: [
            {
              array: false,
              datatype: DataType.STRING,
              key: 'Category',
              required: true,
            },
            {
              array: false,
              datatype: DataType.DATE,
              key: 'Expired',
              required: true,
            },
          ],
          datatype: DataType.OBJECT,
          key: 'Categories',
          required: true,
        },
      ],
      datatype: DataType.OBJECT,
      key: 'Data',
      required: true,
    },
  ];
  const data: CredentialSchemaData = {
    allowSuspension:
      revocationMethod === RevocationMethod.MDOC_MSO_UPDATE_SUSPENSION,
    claims: claims,
    format: CredentialFormat.MDOC,
    layoutProperties: {
      background: {
        color: '#375548',
      },
      code: {
        attribute: 'Address/city',
        type: CodeType.QrCode,
      },
      logo: {
        backgroundColor: '#77722a',
        fontColor: '#b23d3d',
      },
      pictureAttribute: 'Credentials/image',
      primaryAttribute: 'Credentials/first name',
      secondaryAttribute: 'Credentials/last name',
    },
    layoutType: LayoutType.CARD,
    name: `Driver's license ${uuid}`,
    revocationMethod,
    schemaId: `org.iso.18013.5.1.mDL-${uuid}`,
  };
  return await createCredentialSchema(authToken, data);
};

interface GetCredentialSchemaData {
  allowSuspension?: boolean;
  claims?: CredentialClaimSchemaRequestDTO[];
  format: CredentialFormat;
  layoutProperties?: LayoutProperties;
  name?: string;
  organisationId?: string;
  revocationMethod?: RevocationMethod;
  walletStorageType?: WalletKeyStorageType;
}

export const getCredentialSchemaData = ({
  format,
  name,
  revocationMethod = RevocationMethod.NONE,
  walletStorageType = WalletKeyStorageType.SOFTWARE,
  organisationId,
  claims,
  allowSuspension = false,
  layoutProperties,
}: GetCredentialSchemaData): CredentialSchemaData => {
  let schemaClaims =
    format === CredentialFormat.MDOC ? [getObjectClaim()] : getSimpleClaims();
  if (claims) {
    schemaClaims = claims;
  }
  const schemaName =
    name ??
    `schema-${getCredentialSchemaName(
      format,
      revocationMethod,
      walletStorageType,
    )}-${shortUUID()}`;
  const credentialSchemaData = {
    allowSuspension: allowSuspension ?? false,
    claims: schemaClaims,
    format: format,
    layoutType: LayoutType.CARD,
    name: `schema-${getCredentialSchemaName(
      format,
      revocationMethod,
      walletStorageType,
    )}-${shortUUID()}`,
    organisationId: organisationId ?? process.env.IssuerOrganisationId ?? '',
    revocationMethod: revocationMethod,
    walletStorageType: walletStorageType,
  };
  if (format === CredentialFormat.MDOC) {
    const schemaId = `org.iso.18013.5.1.${schemaName}.mDL`;
    Object.assign(credentialSchemaData, { schemaId: schemaId });
    if (revocationMethod === RevocationMethod.MDOC_MSO_UPDATE_SUSPENSION) {
      Object.assign(credentialSchemaData, { allowSuspension: true });
    }
  }
  if (format === CredentialFormat.SD_JWT_VC) {
    const schemaId = `vct-${schemaName}`;
    Object.assign(credentialSchemaData, { schemaId: schemaId });
  }
  if (layoutProperties) {
    Object.assign(credentialSchemaData, { layoutProperties: layoutProperties });
  }

  return credentialSchemaData;
};
