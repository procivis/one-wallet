import {
  PresentationDefinitionV2,
  PresentationDefinitionV2Credential,
  PresentationSubmitV2CredentialRequest,
} from '@procivis/react-native-one-core';

import { objectByTimestampSorter } from './sorting';

export type CredentialQuerySelection = Record<
  string,
  PresentationSubmitV2CredentialRequest[]
>;

export type SetCredentialQuerySelection = Record<
  string,
  CredentialQuerySelection
>;

export const preselectCredentialsForPresentationDefinitionV2 = (
  presentationDefinition: PresentationDefinitionV2,
  preselectedCredentialIds?: string[],
) => {
  const preselected =
    presentationDefinition.credentialSets.reduce<SetCredentialQuerySelection>(
      (acc, set, index) => {
        if (set.required) {
          acc[index] = set.options[0]?.reduce<CredentialQuerySelection>(
            (acc2, queryId) => {
              const credentialQuery =
                presentationDefinition.credentialQueries[queryId];
              if (
                credentialQuery &&
                credentialQuery.credentialOrFailureHint.type_ ===
                  'APPLICABLE_CREDENTIALS'
              ) {
                const selectedCredential = pickFromApplicable(
                  credentialQuery.credentialOrFailureHint.applicableCredentials,
                  preselectedCredentialIds,
                );

                const userSelections: PresentationSubmitV2CredentialRequest['userSelections'] =
                  [];

                // preselect all claims for the ISO mDL flow
                if (
                  selectedCredential.claims.every((claim) => !claim.required)
                ) {
                  userSelections.push(
                    ...selectedCredential.claims
                      .filter((claim) => claim.userSelection)
                      .map((claim) => claim.path),
                  );
                }

                acc2[queryId] = [
                  {
                    credentialId: selectedCredential.id,
                    userSelections,
                  },
                ];
              }
              return acc2;
            },
            {},
          );
        }
        return acc;
      },
      {},
    );

  return preselected;
};

function pickFromApplicable(
  applicableCredentials: PresentationDefinitionV2Credential[],
  preselectedCredentialIds?: string[],
): PresentationDefinitionV2Credential {
  if (preselectedCredentialIds) {
    const preselected = applicableCredentials.find((credential) =>
      preselectedCredentialIds.includes(credential.id),
    );
    if (preselected) {
      return preselected;
    }
  }

  // otherwise return the latest
  applicableCredentials.sort(objectByTimestampSorter('issuanceDate', false));
  return applicableCredentials[0];
}
