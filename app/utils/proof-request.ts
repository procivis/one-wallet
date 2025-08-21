import {
  CredentialDetail,
  CredentialStateEnum,
  PresentationDefinitionRequestedCredential,
  PresentationDefinitionRequestGroup,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';

export const preselectCredentialsForRequestGroups = (
  requestGroups: PresentationDefinitionRequestGroup[],
  allCredentials: CredentialDetail[],
) => {
  const preselected: Record<
    PresentationDefinitionRequestedCredential['id'],
    PresentationSubmitCredentialRequest | undefined
  > = {};

  requestGroups.forEach((group) =>
    group.requestedCredentials.forEach((credentialRequest) => {
      preselected[credentialRequest.id] = preselectClaimsForRequestedCredential(
        credentialRequest,
        allCredentials,
      );
    }),
  );

  return preselected;
};

const preselectClaimsForRequestedCredential = (
  credentialRequest: PresentationDefinitionRequestedCredential,
  allCredentials: CredentialDetail[],
): PresentationSubmitCredentialRequest | undefined => {
  const credentialId = pickPreselectedCredential(
    credentialRequest,
    allCredentials,
  );
  if (!credentialId) {
    return undefined;
  }

  const requiredFields = credentialRequest.fields.filter(
    (field) => field.required,
  );
  const requiredFieldsWithNoKeyMapping = requiredFields.filter(
    (field) => !(credentialId in field.keyMap),
  );

  const fullyNestedFields = getFullyNestedFields(
    credentialRequest.fields,
    credentialId,
  );

  const fullyNestedRequiredFields = fullyNestedFields.filter(
    (field) => field.required,
  );

  let preselectedFields = [
    ...requiredFieldsWithNoKeyMapping,
    ...fullyNestedRequiredFields,
  ];

  // if no required fields, preselect all present claims
  if (!preselectedFields.length) {
    preselectedFields = fullyNestedFields;
  }

  return {
    credentialId,
    submitClaims: preselectedFields.map((field) => field.id),
  };
};

const getFullyNestedFields = (
  fields: PresentationDefinitionRequestedCredential['fields'],
  credentialId: CredentialDetail['id'],
) => {
  const allKeys = fields
    .filter((field) => credentialId in field.keyMap)
    .map((field) => field.keyMap[credentialId]);

  return fields
    .map((field) => ({ field, key: field.keyMap[credentialId] }))
    .filter(({ key }) => key && allKeys.every((k) => !k.startsWith(`${key}/`)))
    .map(({ field }) => field);
};

const pickPreselectedCredential = (
  credentialRequest: PresentationDefinitionRequestedCredential,
  allCredentials: CredentialDetail[],
): CredentialDetail['id'] | undefined => {
  const applicableValidCredential = allCredentials.find(
    ({ id, state }) =>
      state === CredentialStateEnum.ACCEPTED &&
      credentialRequest.applicableCredentials.includes(id),
  );
  if (applicableValidCredential) {
    return applicableValidCredential.id;
  }

  const inapplicableValidCredential = allCredentials.find(
    ({ id, state }) =>
      state === CredentialStateEnum.ACCEPTED &&
      credentialRequest.inapplicableCredentials.includes(id),
  );
  if (inapplicableValidCredential) {
    return inapplicableValidCredential.id;
  }

  return (
    // applicable credentials should only contain valid credentials, so this is only for safety fallback
    credentialRequest.applicableCredentials[0] ??
    credentialRequest.inapplicableCredentials[0]
  );
};
