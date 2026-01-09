import {
  Button,
  ButtonType,
  concatTestID,
  getV2CredentialAvailablePaths,
  nonEmptyFilter,
  ProofRequestSet,
  ShareCredentialV2,
  ShareCredentialV2Group,
  useCredentialListExpandedCard,
  useCredentialRevocationCheck,
  useMemoAsync,
  useONECore,
} from '@procivis/one-react-native-components';
import {
  CredentialListItemBindingDto,
  CredentialQueryResponseBindingDto,
  PresentationDefinitionV2ClaimBindingDto,
  PresentationDefinitionV2ResponseBindingDto,
  PresentationSubmitV2CredentialRequestBindingDto,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import { cloneDeep, isEqual, uniq } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { shareCredentialLabels } from '../../utils/credential-sharing';
import {
  CredentialSet,
  credentialSetsFromPresentationDefinitionV2,
  shareCredentialGroupLabels,
  sortedCredentialSets,
} from '../../utils/credential-sharing-v2';
import {
  CredentialQuerySelection,
  preselectCredentialsForPresentationDefinitionV2,
  SetCredentialQuerySelection,
} from '../../utils/proof-request';
import { ProofPresentationProps } from './proof-presentation-props';

function selectCredential(
  setId: string,
  credentialQueryId: string,
  presentationDefinition:
    | PresentationDefinitionV2ResponseBindingDto
    | undefined,
  selectedCredentials: SetCredentialQuerySelection,
  navigation: ShareCredentialNavigationProp<'ProofRequest'>,
) {
  const credentialQuery =
    presentationDefinition?.credentialQueries[credentialQueryId];
  if (
    !credentialQuery ||
    credentialQuery.credentialOrFailureHint.type_ !== 'APPLICABLE_CREDENTIALS'
  ) {
    return;
  }

  let preselectedCredentialIds: string[] | undefined = selectedCredentials[
    setId
  ]?.[credentialQueryId]?.map((c) => c.credentialId);

  preselectedCredentialIds ??= [
    credentialQuery.credentialOrFailureHint.applicableCredentials[0]?.id,
  ];

  navigation.navigate('SelectCredentialV2', {
    credentialQuery,
    credentialQueryId,
    preselectedCredentialIds,
  });
}

function getNewSelection(
  previousSelection: SetCredentialQuerySelection,
  credentialQueryId: string,
  credentialQuery: CredentialQueryResponseBindingDto | undefined,
  selectedCredentialIds: string[],
) {
  if (
    !credentialQuery ||
    credentialQuery.credentialOrFailureHint.type_ !== 'APPLICABLE_CREDENTIALS'
  ) {
    return { selection: previousSelection, setsChanged: 0 };
  }

  const applicableCredentials =
    credentialQuery.credentialOrFailureHint.applicableCredentials;

  const newSelection = cloneDeep(previousSelection);
  let setsChanged = 0;
  Object.entries(previousSelection).forEach(([setId, queriesSelections]) => {
    const selection = queriesSelections[credentialQueryId];
    if (!selection) {
      return;
    }
    const credentialSelections = Array.isArray(selection)
      ? selection
      : [selection];
    setsChanged += 1;
    if (!credentialQuery.multiple) {
      const selectedCredentialId = selectedCredentialIds[0];
      const credential = applicableCredentials.find(
        (c) => c.id === selectedCredentialId,
      );
      if (!credential) {
        return;
      }
      const credentialAvailablePaths =
        getV2CredentialAvailablePaths(credential);
      const userSelections = credentialSelections[0].userSelections.filter(
        (path) => credentialAvailablePaths.includes(path),
      );
      newSelection[setId][credentialQueryId] = [
        {
          credentialId: selectedCredentialId,
          userSelections,
        },
      ];
    } else {
      const initialUserSelections =
        credentialSelections.length === 1 &&
        !selectedCredentialIds.includes(credentialSelections[0].credentialId)
          ? credentialSelections[0].userSelections
          : [];
      const newMultipleSelection = selectedCredentialIds.map((id) => {
        const credential = applicableCredentials.find((c) => c.id === id);
        if (!credential) {
          return undefined;
        }
        const credentialAvailablePaths =
          getV2CredentialAvailablePaths(credential);
        const alreadySelected = credentialSelections.find(
          (s) => s.credentialId === id,
        );
        const userSelections =
          alreadySelected?.userSelections ?? initialUserSelections;
        return {
          credentialId: id,
          userSelections: userSelections.filter((path) =>
            credentialAvailablePaths.includes(path),
          ),
        };
      });
      newSelection[setId][credentialQueryId] =
        newMultipleSelection.filter(nonEmptyFilter);
    }
  });

  return { selection: newSelection, setsChanged };
}

function prepareSubmission(
  credentialSets: CredentialSet[],
  selectedCredentials: SetCredentialQuerySelection,
) {
  let allSetsValid = true;
  const credentials = credentialSets.reduce<CredentialQuerySelection>(
    (acc, credentialSet, setIndex) => {
      const set = selectedCredentials[setIndex.toString()];
      const setRequired = credentialSet.required;
      if (!set) {
        if (setRequired) {
          allSetsValid = false;
        }
        return acc;
      }
      if (setRequired && !credentialSet.valid) {
        allSetsValid = false;
      }
      Object.entries(set).forEach(([requestQueryId, request]) => {
        if (!acc[requestQueryId]) {
          acc[requestQueryId] = request;
          return;
        }
        const requestArray = Array.isArray(request) ? request : [request];
        const currentRequest = acc[requestQueryId];
        requestArray.forEach((credentialRequest) => {
          let currentCredentialRequest:
            | PresentationSubmitV2CredentialRequestBindingDto
            | undefined;
          if (Array.isArray(currentRequest)) {
            currentCredentialRequest = currentRequest.find(
              (r) => r.credentialId === credentialRequest.credentialId,
            );
          } else {
            currentCredentialRequest = currentRequest;
          }
          if (!currentCredentialRequest) {
            return;
          }
          const userSelections = uniq(
            currentCredentialRequest.userSelections.concat(
              credentialRequest.userSelections,
            ),
          );
          currentCredentialRequest.userSelections = userSelections;
        });
        acc[requestQueryId] = currentRequest;
      });
      return acc;
    },
    {},
  );

  return { allSetsValid, credentials };
}

function getNewSetSelection(
  requestGroup: string[],
  selectedCredentials: SetCredentialQuerySelection,
  setId: string,
  presentationDefinition:
    | PresentationDefinitionV2ResponseBindingDto
    | undefined,
) {
  return requestGroup.reduce<CredentialQuerySelection>((acc, queryId) => {
    let preselection:
      | PresentationSubmitV2CredentialRequestBindingDto
      | PresentationSubmitV2CredentialRequestBindingDto[]
      | undefined = selectedCredentials[setId]?.[queryId];

    if (!preselection) {
      preselection = Object.entries(selectedCredentials).find(
        ([selectionsSetID, set]) => {
          return selectionsSetID !== setId && set[queryId];
        },
      )?.[1][queryId];
    }

    if (!preselection) {
      const credentialQuery =
        presentationDefinition?.credentialQueries[queryId]
          .credentialOrFailureHint;
      if (
        credentialQuery &&
        credentialQuery.type_ === 'APPLICABLE_CREDENTIALS'
      ) {
        preselection = credentialQuery.applicableCredentials?.[0]
          ? [
              {
                credentialId: credentialQuery.applicableCredentials[0].id,
                userSelections: [],
              },
            ]
          : undefined;
      }
    }

    if (preselection) {
      acc[queryId] = preselection;
    }

    return acc;
  }, {});
}

const ProofPresentationV2: FC<ProofPresentationProps> = ({
  onPresentationDefinitionLoaded,
  proofAccepted,
}) => {
  const onImagePreview = useCredentialImagePreview();
  const { core } = useONECore();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck(false);
  const { expandedCredential, onHeaderPress, setInitialCredential } =
    useCredentialListExpandedCard();
  const sharingNavigation =
    useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const [selectedCredentials, setSelectedCredentials] =
    useState<SetCredentialQuerySelection>({});
  const [submitCredentials, setSubmitCredentials] =
    useState<CredentialQuerySelection>({});
  const [allSelectionsValid, setAllSelectionsValid] = useState(true);

  const {
    request: { interactionId, proofId },
    selectedV2Credentials,
  } = route.params;

  const presentationDefinition = useMemoAsync(async () => {
    const definition = await core.getPresentationDefinitionV2(proofId);

    onPresentationDefinitionLoaded();

    // refresh revocation status of the applicable credentials
    const credentialIds = new Set<string>(
      Object.values(definition.credentialQueries)
        .flatMap((query) => {
          if (
            query.credentialOrFailureHint.type_ !== 'APPLICABLE_CREDENTIALS'
          ) {
            return;
          }
          return query.credentialOrFailureHint.applicableCredentials.flatMap(
            ({ id }) => id,
          );
        })
        .filter(nonEmptyFilter),
    );
    await checkRevocation(Array.from(credentialIds));

    return definition;
  }, [checkRevocation, core, proofId]);

  const credentialSets: CredentialSet[] = useMemo(() => {
    if (!presentationDefinition) {
      return [];
    }
    return credentialSetsFromPresentationDefinitionV2(presentationDefinition);
  }, [presentationDefinition]);

  const { optionSets, simpleSets } = useMemo(
    () => sortedCredentialSets(credentialSets),
    [credentialSets],
  );

  // initial selection of credentials/claims
  useEffect(() => {
    if (!presentationDefinition) {
      return;
    }
    setSelectedCredentials(
      preselectCredentialsForPresentationDefinitionV2(presentationDefinition),
    );
  }, [presentationDefinition, setSelectedCredentials]);

  // Initially expanded credential
  useEffect(() => {
    const optionSets = presentationDefinition?.credentialSets.filter(
      (set) =>
        !set.required || set.options.length > 1 || set.options[0]?.length > 1,
    );
    if (optionSets?.length) {
      return;
    }
    const firstCredentialId =
      presentationDefinition?.credentialSets[0]?.options[0]?.[0];
    if (firstCredentialId) {
      setInitialCredential(firstCredentialId);
    }
  }, [presentationDefinition, setInitialCredential]);

  const onSelectCredential =
    (setId: string) => (credentialQueryId: string) => () => {
      selectCredential(
        setId,
        credentialQueryId,
        presentationDefinition,
        selectedCredentials,
        sharingNavigation,
      );
    };

  const onSelectOption =
    (setId: string, requestGroup: string[]) => (selected: boolean) => {
      const credentialSet =
        presentationDefinition?.credentialSets[parseInt(setId)];

      if (!selected && credentialSet?.required) {
        return;
      }

      let newSetSelection: CredentialQuerySelection = {};
      if (selected) {
        newSetSelection = getNewSetSelection(
          requestGroup,
          selectedCredentials,
          setId,
          presentationDefinition,
        );
      }

      if (
        isEqual(newSetSelection, selectedCredentials[setId]) &&
        credentialSet?.required
      ) {
        return;
      }

      setSelectedCredentials((prevSelection) => {
        const newSelection = {
          ...prevSelection,
        };
        newSelection[setId] = newSetSelection;
        return newSelection;
      });
    };

  // result of selection is propagated using the navigation param `selectedV2Credentials`
  useEffect(() => {
    if (!selectedV2Credentials) {
      return;
    }
    sharingNavigation.setParams({ selectedV2Credentials: undefined });
    const { credentialQueryId, selectedCredentialIds } = selectedV2Credentials;
    if (selectedCredentialIds.length === 0) {
      return;
    }
    const credentialQuery =
      presentationDefinition?.credentialQueries[credentialQueryId];

    const { setsChanged, selection: newSelection } = getNewSelection(
      selectedCredentials,
      credentialQueryId,
      credentialQuery,
      selectedCredentialIds,
    );

    if (isEqual(newSelection, selectedCredentials)) {
      return;
    }

    if (setsChanged > 1) {
      // notify user that the change will affect other sets
      Alert.alert(
        translate('info.proofRequest.multiSetChange.title'),
        translate('info.proofRequest.multiSetChange.message'),
        [
          {
            isPreferred: true,
            onPress: () => {
              setSelectedCredentials(newSelection);
            },
            style: 'default',
            text: translate('common.continue'),
          },
          {
            isPreferred: false,
            style: 'cancel',
            text: translate('common.cancel'),
          },
        ],
      );
    } else {
      setSelectedCredentials(newSelection);
    }
  }, [
    presentationDefinition?.credentialQueries,
    selectedCredentials,
    selectedV2Credentials,
    sharingNavigation,
  ]);

  const selectedCredentialsWithUpdatedSelection = (
    currentSelectedCredentials: SetCredentialQuerySelection,
    setId: string,
    requestQueryId: string,
    credentialId: CredentialListItemBindingDto['id'],
    updatedFieldPath: PresentationDefinitionV2ClaimBindingDto['path'],
    selected: boolean,
  ) => {
    const set = currentSelectedCredentials[setId];
    const query = set[requestQueryId];
    const prevSelection = query.find((r) => r.credentialId === credentialId);
    if (!prevSelection) {
      return currentSelectedCredentials;
    }
    let userSelections = [...prevSelection.userSelections];
    if (selected) {
      userSelections.push(updatedFieldPath);
    } else {
      userSelections = userSelections.filter((p) => p !== updatedFieldPath);
    }
    return {
      ...currentSelectedCredentials,
      [setId]: {
        ...set,
        [requestQueryId]: {
          ...query,
          userSelections,
        },
      },
    };
  };

  const onSelectField =
    (setId: string) =>
    (requestQueryId: string) =>
    (
      credentialId: CredentialListItemBindingDto['id'],
      fieldPath: PresentationDefinitionV2ClaimBindingDto['path'],
      selected: boolean,
    ) => {
      setSelectedCredentials((current) =>
        selectedCredentialsWithUpdatedSelection(
          current,
          setId,
          requestQueryId,
          credentialId,
          fieldPath,
          selected,
        ),
      );
    };

  useEffect(() => {
    if (!presentationDefinition || credentialSets.length === 0) {
      setAllSelectionsValid(false);
      return;
    }

    const { allSetsValid, credentials } = prepareSubmission(
      credentialSets,
      selectedCredentials,
    );

    setSubmitCredentials(credentials);
    setAllSelectionsValid(allSetsValid);
  }, [credentialSets, presentationDefinition, selectedCredentials]);

  const onSubmit = useCallback(() => {
    proofAccepted.current = true;

    sharingNavigation.replace('Processing', {
      credentialsV2: submitCredentials,
      interactionId: interactionId,
      proofId,
    });
  }, [
    interactionId,
    proofAccepted,
    proofId,
    sharingNavigation,
    submitCredentials,
  ]);

  if (!presentationDefinition) {
    return null;
  }

  return (
    <>
      {simpleSets.length ? (
        <ProofRequestSet>
          {simpleSets.flatMap((set, setIndex, { length: setLength }) => {
            const lastSet = setIndex === setLength - 1;
            return set.options[0].flatMap(
              (credentialRequestId, optionIndex, { length: optionLength }) => {
                const lastItem = lastSet && optionIndex === optionLength - 1;
                const selected =
                  selectedCredentials[set.id]?.[credentialRequestId]?.[0];
                return (
                  <ShareCredentialV2
                    credentialQuery={
                      presentationDefinition.credentialQueries[
                        credentialRequestId
                      ].credentialOrFailureHint
                    }
                    credentialRequestId={credentialRequestId}
                    expanded={expandedCredential === credentialRequestId}
                    key={`${set.id}-${credentialRequestId}`}
                    labels={shareCredentialLabels()}
                    lastItem={lastItem}
                    onHeaderPress={onHeaderPress}
                    onImagePreview={onImagePreview}
                    onSelectCredential={onSelectCredential(set.id)(
                      credentialRequestId,
                    )}
                    onSelectField={onSelectField(set.id)(credentialRequestId)}
                    selectedCredentialId={selected?.credentialId}
                    selectedFields={selected?.userSelections}
                    style={[
                      styles.requestedCredential,
                      lastItem && styles.requestedCredentialLast,
                    ]}
                    testID={concatTestID(
                      'ProofRequestSharingScreen.credentialSet',
                      set.id,
                      'credential',
                      credentialRequestId,
                    )}
                  />
                );
              },
            );
          })}
        </ProofRequestSet>
      ) : null}
      {optionSets.map((set, setIndex) => {
        const titleOptions = { index: setIndex + 1 };
        const title = set.required
          ? translate('info.proofRequest.set.title', titleOptions)
          : translate('info.proofRequest.optionalSet.title', titleOptions);
        return (
          <ProofRequestSet
            headerLabel={title}
            key={set.id}
            showHeader={true}
            showSeparator={setIndex === 0 && simpleSets.length === 0}
          >
            {set.options.map(
              (
                credentialRequestGroup,
                credentialRequestGroupIndex,
                { length: credentialRequestGroupsLength },
              ) => {
                const valid = credentialRequestGroup.every((queryId) => {
                  const query =
                    presentationDefinition.credentialQueries[queryId];
                  return (
                    queryId &&
                    query.credentialOrFailureHint.type_ ===
                      'APPLICABLE_CREDENTIALS'
                  );
                });
                const lastGroup =
                  credentialRequestGroupIndex ===
                  credentialRequestGroupsLength - 1;
                const groupSelectedCredentials = selectedCredentials[set.id];
                const selected =
                  groupSelectedCredentials &&
                  Object.keys(groupSelectedCredentials).length ===
                    credentialRequestGroup.length &&
                  credentialRequestGroup.every((id) =>
                    Object.keys(groupSelectedCredentials).includes(id),
                  );
                return (
                  <ShareCredentialV2Group
                    key={`${set.id}-${credentialRequestGroupIndex}`}
                    labels={shareCredentialGroupLabels()}
                    lastGroup={lastGroup}
                    onGroupSelect={onSelectOption(
                      set.id,
                      credentialRequestGroup,
                    )}
                    onImagePreview={onImagePreview}
                    onSelectCredential={onSelectCredential(set.id)}
                    onSelectField={onSelectField(set.id)}
                    presentationDefinition={presentationDefinition}
                    requestGroup={credentialRequestGroup}
                    selected={selected}
                    selectedCredentials={selectedCredentials[set.id]}
                    testID={concatTestID(
                      'ProofRequestSharingScreen.credentialSet',
                      set.id,
                      'credentialGroup',
                      credentialRequestGroupIndex.toString(),
                    )}
                    valid={valid}
                  />
                );
              },
            )}
          </ProofRequestSet>
        );
      })}
      <View style={styles.bottom}>
        <Button
          disabled={!allSelectionsValid}
          onPress={onSubmit}
          testID="ProofRequestSharingScreen.shareButton"
          title={translate('common.share')}
          type={allSelectionsValid ? ButtonType.Primary : ButtonType.Secondary}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 64,
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
    paddingTop: 16,
  },
  requestedCredential: {
    marginBottom: 12,
  },
  requestedCredentialLast: {
    marginBottom: 0,
  },
});

export default ProofPresentationV2;
