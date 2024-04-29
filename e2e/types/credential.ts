import {
  CredentialFormat,
  DataType,
  LayoutType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';
import { LayoutProperties } from './credentialSchema';

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
