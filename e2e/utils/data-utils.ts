import { CreateDidRequestDTO } from '../types/credential';
import { DidMethod, KeyType, StorageType, TrustEntityRole } from './enums';
import { shortUUID } from './utils';

export const getTrustEntityRequestData = (
  didId: string,
  trustAnchorId: string,
  role: TrustEntityRole,
  logo?: string,
  privacyUrl?: string,
  termsUrl?: string,
  website?: string,
) => {
  const trustEntityRequestData = {
    didId: didId,
    name: `trust-entity-${shortUUID()}`,
    role: role,
    trustAnchorId: trustAnchorId,
  };
  if (logo) {
    Object.assign(trustEntityRequestData, { logo: logo });
  }
  if (privacyUrl) {
    Object.assign(trustEntityRequestData, { privacyUrl: privacyUrl });
  }
  if (termsUrl) {
    Object.assign(trustEntityRequestData, { termsUrl: termsUrl });
  }
  if (website) {
    Object.assign(trustEntityRequestData, { website: website });
  }
  return trustEntityRequestData;
};

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
  const prefix = prefixName || `did-${didMethod}`;
  const name = `${prefix}-${shortUUID()}`;
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
