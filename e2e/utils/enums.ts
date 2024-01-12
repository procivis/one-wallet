export enum KeyType {
  BBS = 'BBS+',
  EDDSA = 'EDDSA',
  ES256 = 'ES256',
}

export enum StorageType {
  AZURE_VAULT = 'AZURE_VAULT',
  INTERNAL = 'INTERNAL',
  PKCS11 = 'PKCS11',
}

export enum DidType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

export enum DidMethod {
  JWK = 'JWK',
  KEY = 'KEY',
  WEB = 'WEB',
  X509 = 'X509',
}

export enum Transport {
  MDL = 'MDL',
  OPENID4VC = 'OPENID4VC',
  PROCIVIS = 'PROCIVIS_TEMPORARY',
}

export enum RevocationMethod {
  LVVC = 'LVVC',
  NONE = 'NONE',
  STATUSLIST2021 = 'STATUSLIST2021',
}

export enum CredentialFormat {
  JSON_LD = 'JSON_LD',
  JWT = 'JWT',
  MDOC = 'MDOC',
  SDJWT = 'SDJWT',
}
