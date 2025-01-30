import {
  CredentialListItem,
  CredentialStateEnum,
  PresentationDefinitionRequestedCredential,
  PresentationDefinitionRequestGroup,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';

export const preselectCredentialsForRequestGroups = (
  requestGroups: PresentationDefinitionRequestGroup[],
  allCredentials: CredentialListItem[],
) => {
  const preselected: Record<
    PresentationDefinitionRequestedCredential['id'],
    PresentationSubmitCredentialRequest | undefined
  > = {};
  requestGroups.forEach((group) =>
    group.requestedCredentials.forEach((credential) => {
      let selectedCredential = allCredentials.find(
        ({ id, state }) =>
          state === CredentialStateEnum.ACCEPTED &&
          credential.applicableCredentials.includes(id),
      );
      if (!selectedCredential) {
        selectedCredential = allCredentials.find(
          ({ id, state }) =>
            state === CredentialStateEnum.ACCEPTED &&
            credential.inapplicableCredentials.includes(id),
        );
      }
      const credentialId =
        selectedCredential?.id ??
        credential.applicableCredentials[0] ??
        credential.inapplicableCredentials[0];
      if (!credentialId) {
        preselected[credential.id] = undefined;
        return;
      }

      const requiredFields = credential.fields.filter(
        (field) => field.required,
      );

      let preselectedFields = requiredFields;
      // if no required fields, preselect all present claims
      if (!preselectedFields.length) {
        preselectedFields = credential.fields.filter(
          (field) => credentialId in field.keyMap,
        );
      }

      preselected[credential.id] = {
        credentialId,
        submitClaims: preselectedFields.map((field) => field.id),
      };
    }),
  );

  return preselected;
};
