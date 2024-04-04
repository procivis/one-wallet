import {
  CredentialFormat,
  DataType,
  LayoutType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';

export interface CredentialSchemaListResponseDTO {
  createdDate: string;
  format: CredentialFormat;
  id: string;
  lastModified: string;
  layoutType: LayoutType;
  name: string;
  revocationMethod: RevocationMethod;
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
  organisationId: string;
  walletStorageType?: WalletKeyStorageType;
}
