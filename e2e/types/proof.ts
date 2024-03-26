import {
  CredentialFormat,
  DataType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';

export interface CredentialSchemaListResponseDTO {
  createdDate: string;
  format: CredentialFormat;
  id: string;
  lastModified: string;
  name: string;
  revocationMethod: RevocationMethod;
}
export interface CredentialClaimSchemaResponseDTO {
  createdDate: string;
  datatype: DataType;
  id: string;
  key: string;
  lastModified: string;
  name: string;
  required: boolean;
}

export interface CredentialSchemaResponseDTO
  extends CredentialSchemaListResponseDTO {
  claims: CredentialClaimSchemaResponseDTO[];
  organisationId: string;
  walletStorageType?: WalletKeyStorageType;
}
