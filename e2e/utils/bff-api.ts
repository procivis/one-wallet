import fetch from 'node-fetch';

const BFF_BASE_URL = 'https://desk.dev.one-trust-solution.com';
const LOGIN = {
  email: 'test@test.com',
  password: 'tester26',
  method: 'PASSWORD',
};

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
    return res.json();
  });
}

async function getCredentialSchema(authToken: string) {
  const schemaId = await apiRequest('/api/credential-schema/v1?page=0&pageSize=1', authToken).then(
    (res) => res?.values?.[0]?.id,
  );
  return apiRequest(`/api/credential-schema/v1/${schemaId}`, authToken);
}

async function getDid(authToken: string) {
  return apiRequest('/api/did/v1?page=0&pageSize=1', authToken).then((res) => res?.values?.[0]);
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

/**
 * Get credential issuance invitation URL
 * @param credentialId
 * @param authToken
 * @returns {string} invitationUrl
 */
export async function offerCredential(credentialId: string, authToken: string): Promise<string> {
  return apiRequest(`/api/credential/v1/${credentialId}/share`, authToken, 'POST').then((res) => res.url);
}
