import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

import { CredentialFormat, RevocationMethod, Transport } from './enums';

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
  }).then((res) => {
    if (!res.ok) {
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
): Promise<Record<string, any>> {
  const schemaId = await apiRequest(
    '/api/credential-schema/v1?page=0&pageSize=1',
    authToken,
  ).then((res) => res?.values?.[0]?.id);
  return apiRequest(`/api/credential-schema/v1/${schemaId}`, authToken);
}

export interface CredentialSchemaData {
  claims: Array<{ datatype: string; key: string; required: boolean }>;
  format: CredentialFormat;
  name: string;
  revocationMethod: RevocationMethod;
}

export async function createCredentialSchema(
  authToken: string,
  data?: Partial<CredentialSchemaData>,
): Promise<Record<string, any>> {
  const schemaData = Object.assign(
    {
      claims: [{ datatype: 'STRING', key: 'field', required: true }],
      format: CredentialFormat.SDJWT,
      name: `detox-e2e-revocable-${uuidv4()}`,
      revocationMethod: RevocationMethod.STATUSLIST2021,
    },
    data,
  );
  const schemaId = await apiRequest(
    '/api/credential-schema/v1',
    authToken,
    'POST',
    schemaData,
  ).then((res) => res?.id);
  return apiRequest(`/api/credential-schema/v1/${schemaId}`, authToken);
}

async function getProofSchemaDetail(proofSchemaId: string, authToken: string) {
  return apiRequest(`/api/proof-schema/v1/${proofSchemaId}`, authToken);
}

async function getLocalDid(authToken: string) {
  return apiRequest(
    '/api/did/v1?page=0&pageSize=1&type=LOCAL&deactivated=false',
    authToken,
  ).then((response) => {
    return response.values[0];
  });
}

export interface CredentialData {
  claimValues: Array<{ claimId: string; value: string }>;
  redirectUri: string;
  transport: Transport;
}

/**
 * Create a new credential to be issued
 * @param authToken
 * @returns {string} credentialId
 */
export async function createCredential(
  authToken: string,
  schema?: Record<string, any>,
  credentialData?: Partial<CredentialData>,
): Promise<string> {
  const credentialSchema: Record<string, any> =
    schema ?? (await getCredentialSchema(authToken));
  const did: Record<string, any> = await getLocalDid(authToken);
  const claimValues = credentialSchema.claims.map(
    ({ id, datatype }: { datatype: string; id: string }) => {
      let value: string = '';
      switch (datatype) {
        case 'STRING':
          value = 'string';
          break;
        case 'NUMBER':
          value = '42';
          break;
        case 'DATE':
          value = '2023-08-21T07:29:27.850Z';
          break;
        case 'PICTURE':
          value =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
          break;
      }
      return {
        claimId: id,
        value,
      };
    },
  );
  const data = Object.assign(
    {
      claimValues,
      credentialSchemaId: credentialSchema.id,
      issuerDid: did.id,
      transport: Transport.PROCIVIS,
    },
    credentialData,
  );
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
  credentialSchema: Record<string, any>,
  data?: Partial<ProofSchemaData>,
): Promise<Record<string, any>> {
  const proofSchemaData = Object.assign(
    {
      claimSchemas: [
        {
          id: credentialSchema.claims[0].id,
          required: true,
        },
      ],
      expireDuration: 0,
      name: `detox-e2e-test-${uuidv4()}`,
    },
    data,
  );
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
): Promise<string> {
  const did: Record<string, any> = await getLocalDid(authToken);
  const credentialSchema = await getCredentialSchema(authToken);
  const schema: Record<string, any> =
    proofSchema ?? (await createProofSchema(authToken, credentialSchema));
  const data = Object.assign(
    {
      proofSchemaId: schema.id,
      transport: Transport.PROCIVIS,
      verifierDid: did.id,
    },
    proofRequestData,
  );
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
