import { Instance, protect, types, unprotect } from 'mobx-state-tree';

import { generateUUID } from '../../utils/uuid';

const DummyCredentialAttributeModel = types.model('Attribute', {
  key: types.identifier,
  value: types.string,
});

export enum LogAction {
  Issue = 'issue',
  Share = 'share',
  Revoke = 'revoke',
}

const DummyCredentialLogEntryModel = types.model('LogEntry', {
  id: types.optional(types.identifier, generateUUID),
  action: types.enumeration(Object.values(LogAction)),
  date: types.optional(types.Date, () => new Date()),
});

export const DummyCredentialModel = types.model('DummyCredential', {
  id: types.optional(types.identifier, generateUUID),
  schema: types.string,
  issuer: types.string,
  format: types.enumeration(['mDL']),
  revocation: types.enumeration(['mDL']),
  transport: types.enumeration(['OpenID4VC']),
  attributes: types.array(DummyCredentialAttributeModel),
  log: types.array(DummyCredentialLogEntryModel),
  issuedOn: types.optional(types.Date, () => new Date()),
  expiration: types.maybeNull(types.Date),
});

export interface Credential extends Instance<typeof DummyCredentialModel> {}

export interface NewCredential {
  schema: string;
  issuer: string;
  format: 'mDL';
  revocation: 'mDL';
  transport: 'OpenID4VC';
  attributes: Array<{ key: string; value: string }>;
  log: Array<{ action: LogAction; date: Date }>;
  expiration?: Date;
}

export const convertNewCredential = (data: NewCredential): Credential => {
  const { attributes, log, ...credentialData } = data;

  const credential = DummyCredentialModel.create({
    ...credentialData,
    attributes: [],
    log: [],
  });

  unprotect(credential);
  attributes.forEach((attribute) => credential.attributes.push(attribute));
  log.forEach((entry) => credential.log.push(entry));
  protect(credential);

  return credential;
};
