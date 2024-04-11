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
  STATUSLIST2021 = 'BITSTRINGSTATUSLIST',
}

export enum CredentialFormat {
  JSON_LD = 'JSON_LD',
  JWT = 'JWT',
  MDOC = 'MDOC',
  SDJWT = 'SDJWT',
}

export declare enum HistoryEntityTypeEnum {
  CREDENTIAL = 'CREDENTIAL',
  CREDENTIAL_SCHEMA = 'CREDENTIAL_SCHEMA',
  DID = 'DID',
  KEY = 'KEY',
  ORGANISATION = 'ORGANISATION',
  PROOF = 'PROOF',
  PROOF_SCHEMA = 'PROOF_SCHEMA',
}

export enum WalletKeyStorageType {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
}

export enum DataType {
  BIRTH_DATE = 'BIRTH_DATE',
  COUNT = 'COUNT',
  DATE = 'DATE',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER',
  OBJECT = 'OBJECT',
  PICTURE = 'PICTURE',
  STRING = 'STRING',
}

export enum LayoutType {
  CARD = 'CARD',
  DOCUMENT = 'DOCUMENT',
  SINGLE_ATTRIBUTE = 'SINGLE_ATTRIBUTE',
}

export enum LoadingResultState {
  Error = 'error',
  Failure = 'failure',
  InProgress = 'inProgress',
  Success = 'success',
}
