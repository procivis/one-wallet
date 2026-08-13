import {
  Claim,
  ClaimSchemaInfo,
  CoreConfig,
  CredentialDetail,
  CredentialRole,
  CredentialSchemaInfo,
  CredentialState,
  CredentialType,
  interfaceMethodNames,
  ONECore,
} from '@procivis/react-native-one-core';

type ONECoreMock = {
  [K in keyof ONECore]: jest.Mock<
    ReturnType<ONECore[K]>,
    Parameters<ONECore[K]>
  >;
};

const mock: Partial<Record<keyof ONECore, jest.Mock>> = {};
for (const method of interfaceMethodNames) {
  mock[method] = jest
    .fn(() => Promise.reject(new Error(`Core.${method} called`)))
    .mockName(`Core.${method}`);
}

export const ONE_CORE_MOCK: ONECoreMock = {
  ...(mock as ONECoreMock),
  getConfig: jest.fn(() => Promise.resolve(dummyCoreConfig)),
  uninitialize: jest.fn((..._args) => Promise.resolve()),
};

export const dummyCredentialSchemaInfo: CredentialSchemaInfo = {
  allowSuspension: false,
  createdDate: '2026-07-02T08:58:43.002Z',
  format: 'JWT',
  id: 'credentialSchemaInfo-id',
  importedSourceUrl: 'importedSourceUrl',
  lastModified: '2026-07-02T08:58:43.002Z',
  name: 'schema-name',
  requiresWalletInstanceAttestation: false,
  schemaId: 'schemaId',
};

export const dummyClaimSchemaInfo: ClaimSchemaInfo = {
  array: false,
  claims: [],
  createdDate: '2026-07-02T08:58:43.002Z',
  datatype: 'STRING',
  id: 'claimSchema-id',
  key: 'key',
  lastModified: '2026-07-02T08:58:43.002Z',
  required: false,
  translations: {
    name: {
      en: 'claimSchema-name-EN',
    },
  },
};

export const dummyClaim: Claim = {
  path: 'key',
  schema: dummyClaimSchemaInfo,
  value: {
    type_: 'STRING',
    value: 'claim-value',
  },
};

export const dummyCredentialDetail: CredentialDetail = {
  claims: [dummyClaim],
  createdDate: '2026-07-02T08:58:43.002Z',
  id: 'credential-id',
  lastModified: '2026-07-02T08:58:43.002Z',
  protocol: 'string',
  role: CredentialRole.HOLDER,
  schema: dummyCredentialSchemaInfo,
  state: CredentialState.ACCEPTED,
  type: CredentialType.SINGLE,
};

export const dummyCoreConfig: CoreConfig = {
  cacheEntities: {},
  credentialIssuer: {},
  datatype: {},
  did: {},
  ecosystem: {},
  format: {},
  globalSettings: {
    defaultLanguage: 'en',
  },
  identifier: {},
  issuanceProtocol: {},
  keyAlgorithm: {},
  keyStorage: {},
  revocation: {},
  task: {},
  transport: {},
  verificationProtocol: {},
  verifierProvider: {},
  walletProvider: {},
};
