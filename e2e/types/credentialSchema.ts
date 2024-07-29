import {
  CredentialFormat,
  DataType,
  LayoutType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';

interface BackgroundLayoutProperties {
  color?: string;
  image?: string;
}
interface CodeLayoutProperties {
  attribute: string;
  type: string;
}

// image or (backgroundColor and fontColor)
interface LogoLayoutProperties {
  backgroundColor?: string;
  fontColor?: string;
  image?: string;
}

export interface LayoutProperties {
  background?: BackgroundLayoutProperties;
  code?: CodeLayoutProperties;
  logo?: LogoLayoutProperties;
  pictureAttribute?: string;
  primaryAttribute?: string;
  secondaryAttribute?: string;
}

export interface CredentialClaimSchemaRequestDTO {
  array: boolean;
  claims?: CredentialClaimSchemaRequestDTO[];
  datatype: DataType;
  key: string;
  required: boolean;
}

export interface CredentialSchemaData {
  claims: CredentialClaimSchemaRequestDTO[];
  format: CredentialFormat;
  layoutProperties?: LayoutProperties;
  layoutType: LayoutType;
  name: string;
  revocationMethod: RevocationMethod;
  schemaId?: string;
  walletStorageType?: WalletKeyStorageType;
}

export interface CredentialDetailCredSchemaDTO {
  createdDate: string;
  format: CredentialFormat;
  id: string;
  lastModified: string;
  name: string;
  organisationId: string;
  revocationMethod: RevocationMethod;
  schemaId: string;
  walletStorageType?: WalletKeyStorageType;
}
