import { CreateDidRequestDTO } from '../types/credential';
import { DidMethod, KeyType, StorageType } from './enums';
import { shortUUID } from './utils';

export const getKeyRequestData = (
  keyType: KeyType,
  storageType: StorageType,
) => {
  return {
    keyParams: {},
    keyType: keyType,
    name: `key-${keyType}-${shortUUID()}`,
    storageParams: {},
    storageType: storageType,
  };
};

export const getDidRequestData = (
  didMethod: DidMethod,
  keyId: string,
  prefixName?: string,
): CreateDidRequestDTO => {
  const name = `${prefixName || `did-${didMethod}`}-${shortUUID()}`;
  const request = {
    keys: {
      assertionMethod: [keyId],
      authentication: [keyId],
      capabilityDelegation: [keyId],
      capabilityInvocation: [keyId],
      keyAgreement: [keyId],
    },
    method: didMethod,
    name: name,
  };
  return request;
};
