import { DidMethod, DidType, KeyType, StorageType } from '../utils/enums';

export interface KeyListResponseDTO {
  createdDate: string;
  id: string;
  keyType: KeyType;
  lastModified: string;
  name: string;
  organisationId: string;
  publicKey: string;
  storageType: StorageType;
}

export interface DidListItemDTO {
  createdDate: string;
  deactivated: boolean;
  did: string;
  id: string;
  lastModified: string;
  method: DidMethod;
  name: string;
  organizationId: string;
  type: DidType;
}

export interface KeyParams {
  assertionMethod: KeyListResponseDTO[];
  authentication: KeyListResponseDTO[];
  capabilityDelegation: KeyListResponseDTO[];
  capabilityInvocation: KeyListResponseDTO[];
  keyAgreement: KeyListResponseDTO[];
}

export interface DidDetailDTO extends DidListItemDTO {
  keys: KeyParams;
}
