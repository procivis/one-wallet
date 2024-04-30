import {
  CredentialFormat,
  CredentialRole,
  CredentialState,
  DataType,
  DidMethod,
  DidType,
  LayoutType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';
import {
  CredentialDetailCredSchemaDTO,
  LayoutProperties,
} from './credentialSchema';

export interface CredentialSchemaListResponseDTO {
  createdDate: string;
  format: CredentialFormat;
  id: string;
  lastModified: string;
  layoutType: LayoutType;
  name: string;
  revocationMethod: RevocationMethod;
  schemaId: string;
  schemaType: string;
}
export interface CredentialClaimSchemaResponseDTO {
  claims?: CredentialClaimSchemaResponseDTO[];
  createdDate: string;
  datatype: DataType;
  id: string;
  key: string;
  lastModified: string;
  required: boolean;
}

export interface CredentialSchemaResponseDTO
  extends CredentialSchemaListResponseDTO {
  claims: CredentialClaimSchemaResponseDTO[];
  layoutProperties: LayoutProperties;
  organisationId: string;
  schemaId: string;
  walletStorageType?: WalletKeyStorageType;
}

interface CredentialSchemaClaimDetailDTO {
  createdDate: string;
  datatype: DataType;
  id: string;
  key: string;
  lastModified: string;
  required: boolean;
}

interface CredentialClaimsResponseDTO {
  schema: CredentialSchemaClaimDetailDTO;
  value: any;
}

interface IssuerDidCredentialResponseDTO {
  createdDate: string;
  deactivated: boolean;
  did: string;
  id: string;
  lastModified: string;
  method: DidMethod;
  name: string;
  type: DidType;
}

export interface CredentialDetailResponseDTO {
  claims: CredentialClaimsResponseDTO[];
  createdDate: string;
  id: string;
  issuanceDate: string;
  issuerDid: IssuerDidCredentialResponseDTO;
  lastModified: string;
  role: CredentialRole;
  schema: CredentialDetailCredSchemaDTO;
  state: CredentialState;
}
