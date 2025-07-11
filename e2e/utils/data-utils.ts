import { CreateDidRequestDTO } from '../types/credential';
import { TrustEntityType } from './api';
import { DidMethod, KeyType, StorageType, TrustEntityRole } from './enums';
import { shortUUID } from './utils';

export const getTrustEntityRequestData = (
{ didId, trustAnchorId, role, logo, privacyUrl, termsUrl, website, type = TrustEntityType.DID,  content}: {
  content?: string;
  didId?: string;
  identifierId?: string;
  logo?: string;
  privacyUrl?: string;
  role: TrustEntityRole;
  termsUrl?: string;
  trustAnchorId: string;
  type?: TrustEntityType;
  website?: string;
}
) => {
  const trustEntityRequestData = {
    name: `trust-entity-${shortUUID()}`,
    role: role,
    trustAnchorId: trustAnchorId,
  };
  if(didId){
    Object.assign(trustEntityRequestData, { didId: didId });
  }
  if(content){
    Object.assign(trustEntityRequestData, { content: content });
  }
  if(type){
    Object.assign(trustEntityRequestData, { type: type });
  }
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
  const prefix = prefixName ?? `did-${didMethod}`;
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
