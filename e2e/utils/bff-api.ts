import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const BFF_BASE_URL = 'https://desk.dev.one-trust-solution.com';
const LOGIN = {
  email: 'test@test.com',
  password: 'tester26',
  method: 'PASSWORD',
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
    method: 'POST',
    headers: { ['Content-Type']: 'application/json' },
    body: JSON.stringify(LOGIN),
  })
    .then((res) => res.json())
    .then((res: any) => res.token);
}

async function apiRequest(
  path: string,
  authToken: string,
  method = 'GET',
  body?: Record<string, unknown>,
): Promise<any> {
  const headers: RequestInit['headers'] = { Authorization: `Bearer ${authToken}` };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(BFF_BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => {
    if (!res.ok) throw Error('HTTP error: ' + res.status);
    if (res.status === 204) {
      return undefined;
    }
    return res.json();
  });
}

async function getCredentialSchema(authToken: string) {
  const schemaId = await apiRequest('/api/credential-schema/v1?page=0&pageSize=1', authToken).then(
    (res) => res?.values?.[0]?.id,
  );
  return apiRequest(`/api/credential-schema/v1/${schemaId}`, authToken);
}

async function getProofSchemaDetail(proofSchemaId: string, authToken: string) {
  return apiRequest(`/api/proof-schema/v1/${proofSchemaId}`, authToken);
}

async function getDid(authToken: string) {
  // TODO: filter DIDs by local type
  return apiRequest('/api/did/v1?page=0&pageSize=100', authToken).then((response) => {
    for (const did of response.values) {
      if (did.type === DidType.LOCAL) {
        return did;
      }
    }
  });
}

/**
 * Create a new credential to be issued
 * @param authToken
 * @returns {string} credentialId
 */
export async function createCredential(authToken: string): Promise<string> {
  const schema: Record<string, any> = await getCredentialSchema(authToken);
  const did: Record<string, any> = await getDid(authToken);
  const claimValues = schema.claims.map(({ id, datatype }: { id: string; datatype: string }) => {
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
    }
    return {
      claimId: id,
      value,
    };
  });

  return await apiRequest('/api/credential/v1', authToken, 'POST', {
    credentialSchemaId: schema.id,
    issuerDid: did.id,
    transport: 'PROCIVIS_TEMPORARY',
    claimValues,
  }).then((res) => res.id);
}

export async function createProofSchema(authToken: string): Promise<Record<string, any>> {
  const credentialSchema: Record<string, any> = await getCredentialSchema(authToken);
  const schemaClaim = credentialSchema.claims[0];
  const proofSchemaData = {
    name: `detox-e2e-test-${uuidv4()}`,
    expireDuration: 0,
    claimSchemas: [
      {
        id: schemaClaim.id,
        required: true,
      },
    ],
  };
  return await apiRequest('/api/proof-schema/v1', authToken, 'POST', proofSchemaData).then((res) =>
    getProofSchemaDetail(res.id, authToken),
  );
}

export async function createProofRequest(authToken: string) {
  const did: Record<string, any> = await getDid(authToken);
  const proofSchema: Record<string, any> = await createProofSchema(authToken);
  await createCredential(authToken);
  const proofRequestData = {
    proofSchemaId: proofSchema.id,
    transport: 'PROCIVIS_TEMPORARY',
    verifierDid: did.id,
  };
  return await apiRequest('/api/proof-request/v1', authToken, 'POST', proofRequestData).then((res) => res.id);
}

/**
 * Get credential issuance invitation URL
 * @param credentialId
 * @param authToken
 * @returns {string} invitationUrl
 */
export async function offerCredential(credentialId: string, authToken: string): Promise<string> {
  return apiRequest(`/api/credential/v1/${credentialId}/share`, authToken, 'POST').then((res) => res.url);
}

export async function revokeCredential(credentialId: string, authToken: string): Promise<undefined> {
  return apiRequest(`/api/credential/v1/${credentialId}/revoke`, authToken, 'POST');
}

export async function requestProof(proofRequestId: string, authToken: string): Promise<string> {
  return apiRequest(`/api/proof-request/v1/${proofRequestId}/share`, authToken, 'POST').then((res) => res.url);
}
