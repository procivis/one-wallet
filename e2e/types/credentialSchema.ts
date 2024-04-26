import {
  CredentialFormat,
  LayoutType,
  RevocationMethod,
  WalletKeyStorageType,
} from '../utils/enums';

interface BackgroundLayoutProperties {
  image: string;
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

export interface CredentialSchemaData {
  claims: Array<{ datatype: string; key: string; required: boolean }>;
  format: CredentialFormat;
  layoutProperties?: LayoutProperties;
  layoutType: LayoutType;
  name: string;
  revocationMethod: RevocationMethod;
  walletStorageType?: WalletKeyStorageType;
}