export enum KeyType {
  EDDSA = 'EDDSA',
  ES256 = 'ES256',
  BBS = 'BBS+',
}

export enum StorageType {
  INTERNAL = 'INTERNAL',
  PKCS11 = 'PKCS11',
  AZURE_VAULT = 'AZURE_VAULT',
}

export enum DidType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

export enum DidMethod {
  KEY = 'KEY',
  WEB = 'WEB',
  X509 = 'X509',
  JWK = 'JWK',
}

export enum Transport {
  PROCIVIS = 'PROCIVIS_TEMPORARY',
  OPENID4VC = 'OPENID4VC',
  MDL = 'MDL',
}

export enum RevocationMethod {
  NONE = 'NONE',
  STATUSLIST2021 = 'STATUSLIST2021',
  LVVC = 'LVVC',
}

export enum CredentialFormat {
  JWT = 'JWT',
  SDJWT = 'SDJWT',
  JSON_LD = 'JSON_LD',
  MDOC = 'MDOC',
}
