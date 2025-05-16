/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import fetch from 'node-fetch';

import {
  CreateDidRequestDTO,
  CreateKeyRequestDTO,
  CredentialClaimSchemaResponseDTO,
  CredentialDetailResponseDTO,
  CredentialSchemaResponseDTO,
} from '../types/credential';
import { CredentialSchemaData } from '../types/credentialSchema';
import { DidDetailDTO, DidListItemDTO } from '../types/did';
import {
  CreateProofSchemaRequestDTO,
  ProofRequestData,
  ProofSchemaResponseDTO,
} from '../types/proof';
import { TrustEntityResponseDTO } from '../types/trustEntity';
import { getDidRequestData, getKeyRequestData } from './data-utils';
import {
  DataType,
  DidMethod,
  DidType,
  IssuanceProtocol,
  KeyRole,
  KeyType,
  StorageType,
  TrustEntityRole,
  VerificationProtocol,
} from './enums';
import { objectToQueryParams } from './utils';

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL;
const API_BASE_URL = process.env.API_BASE_URL;
const LOGIN = {
  client_id: 'login-client',
  client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
  grant_type: 'password',
  password: process.env.KEYCLOAK_PASSWORD,
  username: process.env.KEYCLOAK_USER_NAME,
};

/**
 * Authenticate with Keycloak
 * @returns {string} authToken
 */
export async function keycloakAuth(): Promise<string> {
  const params = new URLSearchParams();
  Object.entries(LOGIN).forEach(([key, value]) => {
    params.append(key, String(value));
  });
  
  return fetch(`${KEYCLOAK_BASE_URL}/realms/dev/protocol/openid-connect/token`, {
    body: params.toString(),
    headers: { ['Content-Type']: 'application/x-www-form-urlencoded' },
    method: 'POST',
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error(`Keycloak auth failed. Status: ${res.status}`, await res.json());
        throw Error('HTTP error: ' + res.status);
      }
      return res.json()})
    .then((res: any) => res.access_token);
}

async function apiRequest(
  path: string,
  authToken: string,
  method = 'GET',
  body?: Record<string, unknown> | object,
): Promise<any> {
  const headers: RequestInit['headers'] = {
    Authorization: `Bearer ${authToken}`,
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(API_BASE_URL + path, {
    body: body ? JSON.stringify(body) : undefined,
    headers,
    method,
  }).then(async (res) => {
    if (!res.ok) {
      console.error(`HTTP Error. Status: ${res.status}`, await res.json());
      throw Error('HTTP error: ' + res.status);
    }
    if (res.status === 204) {
      return undefined;
    }
    return res.json();
  });
}

export async function createCredentialSchema(
  authToken: string,
  data: CredentialSchemaData,
): Promise<CredentialSchemaResponseDTO> {
  const schemaId = await apiRequest(
    '/api/credential-schema/v1',
    authToken,
    'POST',
    data,
  ).then((res) => res?.id);
  return apiRequest(`/api/credential-schema/v1/${schemaId}`, authToken);
}

async function getProofSchemaDetail(
  proofSchemaId: string,
  authToken: string,
): Promise<ProofSchemaResponseDTO> {
  return apiRequest(`/api/proof-schema/v1/${proofSchemaId}`, authToken);
}

interface DidQueryParams {
  didMethods?: DidMethod | DidMethod[];
  keyAlgorithms?: KeyType | KeyType[];
}

export async function getLocalDid(
  authToken: string,
  params?: DidQueryParams,
): Promise<DidListItemDTO> {
  const queryParams = objectToQueryParams({
    deactivated: false,
    didMethods: params?.didMethods ?? DidMethod.KEY,
    keyAlgorithms: params?.keyAlgorithms ?? KeyType.EDDSA,
    keyRoles: [KeyRole.ASSERTION_METHOD],
    page: 0,
    pageSize: 1,
    type: DidType.LOCAL,
  });
  return apiRequest(`/api/did/v1?${queryParams}`, authToken).then(
    (response) => {
      const did = response.values[0];
      if (!did) {
        throw new Error('Did not found');
      }
      return did;
    },
  );
}

export async function getDidDetail(
  authToken: string,
  didId: string,
): Promise<DidDetailDTO> {
  return apiRequest(`/api/did/v1/${didId}`, authToken);
}

export interface TrustAnchorDetailDTO {
  createdDate: string;
  id: string;
  isPublisher: boolean;
  lastModified: string;
  name: string;
  publisherReference: string;
  type: string;
}

export async function getTrustAnchor(
  authToken: string,
  name?: string,
): Promise<TrustAnchorDetailDTO> {
  const queryParams = objectToQueryParams({
    name: name,
  });
  return apiRequest(`/api/trust-anchor/v1?${queryParams}`, authToken).then(
    (response) => {
      const trustAnchor = response.values[0];
      if (!trustAnchor) {
        throw new Error('Trust Anchor not found');
      }
      return trustAnchor;
    },
  );
}

export interface CredentialData {
  claimValues?: Array<{ claimId: string; path: string; value: string }>;
  exchange?: IssuanceProtocol;
  issuerDid: string;
  issuerKey?: string;
  redirectUri?: string;
}

const claimValue = (claim: CredentialClaimSchemaResponseDTO) => {
  let value: string = '';
  switch (claim.datatype) {
    case DataType.STRING:
      value = 'string';
      break;
    case DataType.NUMBER:
      value = '42';
      break;
    case DataType.DATE:
      value = '2023-08-21';
      break;
    case DataType.BIRTH_DATE:
      value = '1996-02-21';
      break;
    case DataType.PICTURE:
      value =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      break;
    case DataType.MDL_PICTURE:
      value =
        'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      break;
    case DataType.EMAIL:
      value = 'test.support@procivis.ch';
      break;
    case DataType.BOOLEAN:
      value = 'true';
      break;
  }
  return value;
};

const claimsFilling = (
  claims: CredentialClaimSchemaResponseDTO[],
  path?: string,
  array_key: string = '0',
) => {
  const claimValues: CredentialData['claimValues'] = [];
  claims.forEach((claim) => {
    let fullPath = path ? `${path}/${claim.key}` : claim.key;
    if (claim.array) {
      fullPath = `${fullPath}/${array_key}`;
    }

    if (claim.datatype === DataType.OBJECT) {
      const nestedValues = claimsFilling(claim.claims!, fullPath);
      claimValues.push(...nestedValues);
      return;
    }
    const value: string = claimValue(claim);
    claimValues.push({
      claimId: claim.id,
      path: fullPath,
      value,
    });
  });
  return claimValues;
};

/**
 * Create a new credential to be issued
 * @param authToken
 * @returns {string} credentialId
 */
export async function createCredential(
  authToken: string,
  schema: CredentialSchemaResponseDTO,
  credentialData?: CredentialData,
): Promise<string> {
  const claimValues = claimsFilling(schema.claims);
  const data = {
    claimValues: credentialData?.claimValues ?? claimValues,
    credentialSchemaId: schema.id,
    exchange: credentialData?.exchange ?? IssuanceProtocol.OPENID4VCI_DRAFT13,
    issuerDid: credentialData?.issuerDid,
    issuerKey: credentialData?.issuerKey,
    redirectUri: credentialData?.redirectUri,
  };
  return await apiRequest('/api/credential/v1', authToken, 'POST', data).then(
    (res) => res.id,
  );
}

export interface CreateTrustEntityRequestDTO {
  didId: string;
  logo?: string | null;
  name: string;
  privacyUrl?: string | null;
  role: TrustEntityRole;
  termsUrl?: string | null;
  trustAnchorId: string;
  website?: string | null;
}

export async function createTrustEntity(
  authToken: string,
  trustEntityRequest: CreateTrustEntityRequestDTO,
): Promise<string> {
  return await apiRequest(
    '/api/trust-entity/v1',
    authToken,
    'POST',
    trustEntityRequest,
  ).then((res) => res.id);
}

export async function getTrustEntityDetail(
  trustEntityId: string,
  authToken: string,
): Promise<TrustEntityResponseDTO> {
  return apiRequest(`/api/trust-entity/v1/${trustEntityId}`, authToken);
}

export async function createProofSchema(
  authToken: string,
  proofSchemaData: CreateProofSchemaRequestDTO,
): Promise<ProofSchemaResponseDTO> {
  return await apiRequest(
    '/api/proof-schema/v1',
    authToken,
    'POST',
    proofSchemaData,
  ).then((res) => getProofSchemaDetail(res.id, authToken));
}

export async function createProofRequest(
  authToken: string,
  proofRequestData: Partial<ProofRequestData>,
): Promise<string> {
  const data = {
    exchange: proofRequestData?.exchange ?? VerificationProtocol.OPENID4VP_DRAFT20,
    proofSchemaId: proofRequestData?.proofSchemaId,
    redirectUri: proofRequestData?.redirectUri,
    verifierDid: proofRequestData?.verifierDid,
    verifierKey: proofRequestData?.verifierKey,
  };
  return await apiRequest(
    '/api/proof-request/v1',
    authToken,
    'POST',
    data,
  ).then((res) => res.id);
}

/**
 * Get credential issuance invitation URL
 * @param credentialId
 * @param authToken
 * @returns {string} invitationUrl
 */
export async function offerCredential(
  credentialId: string,
  authToken: string,
): Promise<EntityShareResponseDTO> {
  return apiRequest(
    `/api/credential/v1/${credentialId}/share`,
    authToken,
    'POST',
  );
}

export interface EntityShareResponseDTO {
  appUrl: string;
  url: string;
}

export async function revokeCredential(
  credentialId: string,
  authToken: string,
): Promise<undefined> {
  return apiRequest(
    `/api/credential/v1/${credentialId}/revoke`,
    authToken,
    'POST',
  );
}

export async function requestProof(
  proofRequestId: string,
  authToken: string,
): Promise<EntityShareResponseDTO> {
  return apiRequest(
    `/api/proof-request/v1/${proofRequestId}/share`,
    authToken,
    'POST',
  );
}

export async function suspendCredential(
  credentialId: string,
  authToken: string,
  suspendEndDate?: string,
): Promise<undefined> {
  const payload = suspendEndDate ? { suspendEndDate } : {};
  return apiRequest(
    `/api/credential/v1/${credentialId}/suspend`,
    authToken,
    'POST',
    payload,
  );
}

export async function getCredentialDetail(
  credentialId: string,
  authToken: string,
): Promise<CredentialDetailResponseDTO> {
  return apiRequest(`/api/credential/v1/${credentialId}`, authToken);
}

export async function revalidateCredential(
  credentialId: string,
  authToken: string,
): Promise<undefined> {
  return apiRequest(
    `/api/credential/v1/${credentialId}/reactivate`,
    authToken,
    'POST',
  );
}

export const createKey = async (
  authToken: string,
  data: CreateKeyRequestDTO,
) => {
  return apiRequest('/api/key/v1', authToken, 'POST', data).then(
    (res) => res.id,
  );
};

export const createDid = async (
  authToken: string,
  data: CreateDidRequestDTO,
) => {
  return apiRequest('/api/did/v1', authToken, 'POST', data).then(
    (res) => res.id,
  );
};

interface CreateDidWithKey {
  didMethod: DidMethod;
  keyType: KeyType;
}

export async function createDidWithKey(
  authToken: string,
  data: CreateDidWithKey,
) {
  const keyId = await createKey(
    authToken,
    getKeyRequestData(data.keyType, StorageType.INTERNAL),
  );
  const didId = await createDid(
    authToken,
    getDidRequestData(data.didMethod, keyId),
  );
  return getDidDetail(authToken, didId);
}

export async function deleteProofRequest(
  authToken: string,
  proofRequestId: string,
) {
  return apiRequest(
    `/api/proof-request/v1/${proofRequestId}`,
    authToken,
    'DELETE',
  );
}
