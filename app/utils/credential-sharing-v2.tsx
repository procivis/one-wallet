import {
  ArrayElement,
  ShareCredentialGroupLabels,
} from '@procivis/one-react-native-components';
import { PresentationDefinitionV2 } from '@procivis/react-native-one-core';

import { translate } from '../i18n';
import { shareCredentialLabels } from './credential-sharing';

export const shareCredentialGroupLabels = (): ShareCredentialGroupLabels => {
  return {
    ...shareCredentialLabels(),
    groupHeader: translate('info.proofRequest.group.header'),
  };
};

export type CredentialSet = ArrayElement<
  PresentationDefinitionV2['credentialSets']
> & {
  id: string;
  valid: boolean;
};

export const credentialSetsFromPresentationDefinitionV2 = (
  presentationDefinition: PresentationDefinitionV2,
): CredentialSet[] => {
  return presentationDefinition.credentialSets.map((set, index) => {
    const filteredOptions = set.options.filter((group) => {
      const arrayGroup = Array.isArray(group) ? group : [group];
      return arrayGroup.every((queryId) => {
        const query = presentationDefinition.credentialQueries[queryId];
        return queryId && 'applicableCredentials' in query;
      });
    });
    return {
      ...set,
      id: index.toString(),
      options: filteredOptions.length ? filteredOptions : set.options,
      valid: Boolean(filteredOptions.length),
    };
  });
};

type SortedCredentialSets = {
  optionSets: CredentialSet[];
  simpleSets: CredentialSet[];
};

export const sortedCredentialSets = (
  credentialSets: CredentialSet[],
): SortedCredentialSets => {
  const simpleSets: CredentialSet[] = [];
  credentialSets.forEach((set) => {
    if (!set.required || set.options.length > 1) {
      return;
    }
    const options = set.options.filter(
      (option) => !simpleSets.some((s) => s.options.includes(option)),
    );
    simpleSets.push({
      ...set,
      options,
    });
  });
  const optionSets = credentialSets.filter(
    (set) =>
      !simpleSets.some((s) => s.id === set.id) && (set.required || set.valid),
  );

  return { optionSets, simpleSets };
};
