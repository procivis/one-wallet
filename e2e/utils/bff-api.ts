import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

import {
  CredentialClaimSchemaResponseDTO,
  CredentialDetailResponseDTO,
  CredentialSchemaResponseDTO,
} from '../types/credential';
import { CredentialSchemaData } from '../types/credentialSchema';
import { ProofSchemaResponseDTO } from '../types/proof';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  KeyRole,
  KeyType,
  LayoutType,
  RevocationMethod,
  Transport,
} from './enums';
import { objectToQueryParams } from './query-params';

const BFF_BASE_URL = 'https://desk.dev.procivis-one.com';
const LOGIN = {
  email: 'e2e_user@procivis.ch',
  method: 'PASSWORD',
  password: 'tester26',
};

export enum DidType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

/**
 * Login to BFF
 * @returns {string} authToken
 */
export async function bffLogin(): Promise<string> {
  return fetch(BFF_BASE_URL + '/api/auth/v1/login', {
    body: JSON.stringify(LOGIN),
    headers: { ['Content-Type']: 'application/json' },
    method: 'POST',
  })
    .then((res) => res.json())
    .then((res: any) => res.token);
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
  return fetch(BFF_BASE_URL + path, {
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

async function getCredentialSchema(
  authToken: string,
): Promise<CredentialSchemaResponseDTO> {
  const schemaId = await apiRequest(
    '/api/credential-schema/v1?page=0&pageSize=1',
    authToken,
  ).then((res) => res?.values?.[0]?.id);
  return apiRequest(`/api/credential-schema/v1/${schemaId}`, authToken);
}

export async function createCredentialSchema(
  authToken: string,
  data?: Partial<CredentialSchemaData>,
  layoutProperties: boolean = false,
): Promise<CredentialSchemaResponseDTO> {
  const layout = {
    background: {
      color: '#1677ff',
    },
    logo: {
      backgroundColor: '#ebb1f9',
      fontColor: '#000000',
    },
  };
  const schemaData: CredentialSchemaData = Object.assign(
    {
      claims: [{ datatype: DataType.STRING, key: 'field', required: true }],
      format: CredentialFormat.SDJWT,
      layoutType: LayoutType.CARD,
      name: `detox-e2e-${uuidv4()}`,
      revocationMethod: RevocationMethod.NONE,
    },
    data,
    layoutProperties ? { layoutProperties: layout } : {},
  );
  const schemaId = await apiRequest(
    '/api/credential-schema/v1',
    authToken,
    'POST',
    schemaData,
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

export async function getLocalDid(authToken: string, params?: DidQueryParams) {
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

export interface CredentialData {
  claimValues?: Array<{ claimId: string; value: string }>;
  issuerDid: string;
  issuerKey?: string;
  redirectUri?: string;
  transport?: Transport;
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
      value = '2023-08-21T07:29:27.850Z';
      break;
    case DataType.BIRTH_DATE:
      value = '1996-02-21T21:00:00.000Z';
      break;
    case DataType.PICTURE:
      value =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      break;
    case DataType.EMAIL:
      value = 'test.support@procivis.ch';
      break;
  }
  return value;
};

const claimsFilling = (claims: CredentialClaimSchemaResponseDTO[]) => {
  const claimValues: CredentialData['claimValues'] = [];
  claims.forEach((claim) => {
    if (claim.datatype === DataType.OBJECT) {
      const nestedValues = claimsFilling(claim.claims!);
      claimValues.push(...nestedValues);
      return;
    }
    const value: string = claimValue(claim);
    claimValues.push({
      claimId: claim.id,
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
    issuerDid: credentialData?.issuerDid,
    issuerKey: credentialData?.issuerKey,
    transport: credentialData?.transport ?? Transport.PROCIVIS,
  };
  return await apiRequest('/api/credential/v1', authToken, 'POST', data).then(
    (res) => res.id,
  );
}

export interface ProofSchemaData {
  claimSchemas: Array<{ id: string; required: boolean }>;
  expireDuration: number;
  name: string;
}

export async function createProofSchema(
  authToken: string,
  credentialSchemas: CredentialSchemaResponseDTO[],
  expireDuration?: number,
): Promise<ProofSchemaResponseDTO> {
  const proofInputSchemas = credentialSchemas.map((credSchema) => ({
    claimSchemas: credSchema.claims.map((claim) => ({
      id: claim.id,
      required: claim.required,
    })),
    credentialSchemaId: credSchema.id,
    validityConstraint:
      credSchema.revocationMethod === RevocationMethod.LVVC ? 10 : undefined,
  }));
  const proofSchemaData = {
    expireDuration: expireDuration || 0,
    name: `proof-schema-${uuidv4()}`,
    proofInputSchemas: proofInputSchemas,
  };
  return await apiRequest(
    '/api/proof-schema/v1',
    authToken,
    'POST',
    proofSchemaData,
  ).then((res) => getProofSchemaDetail(res.id, authToken));
}

export interface ProofRequestData {
  redirectUri: string;
  transport: Transport;
}

export async function createProofRequest(
  authToken: string,
  proofSchema?: Record<string, any>,
  proofRequestData?: Partial<ProofRequestData>,
  credentialSchema?: CredentialSchemaResponseDTO,
): Promise<string> {
  const did: Record<string, any> = await getLocalDid(authToken);
  const credSchema = credentialSchema ?? (await getCredentialSchema(authToken));
  const schema: Record<string, any> =
    proofSchema ?? (await createProofSchema(authToken, [credSchema]));
  const data = {
    proofSchemaId: schema.id,
    transport: Transport.PROCIVIS,
    verifierDid: did.id,
    ...proofRequestData,
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
): Promise<string> {
  return apiRequest(
    `/api/credential/v1/${credentialId}/share`,
    authToken,
    'POST',
  ).then((res) => res.url);
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
): Promise<string> {
  return apiRequest(
    `/api/proof-request/v1/${proofRequestId}/share`,
    authToken,
    'POST',
  ).then((res) => res.url);
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
