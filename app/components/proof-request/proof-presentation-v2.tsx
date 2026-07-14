import {
  Button,
  ButtonType,
  concatTestID,
  getV2CredentialAvailablePaths,
  nonEmptyFilter,
  ProofRequestSet,
  ShareCredentialV2,
  ShareCredentialV2Group,
  StatusWarningIcon,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useCredentialListExpandedCard,
  useCredentialRevocationCheck,
  useMemoAsync,
  useONECore,
} from '@procivis/one-react-native-components';
import {
  CredentialListItem,
  CredentialQuery,
  PresentationDefinitionV2,
  PresentationDefinitionV2Claim,
  PresentationSubmitV2CredentialRequest,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import { cloneDeep, isEqual, uniq } from 'lodash';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCurrentLanguage } from '../../hooks/language';
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
  preselectTransactionCredentialsForPresentationDefinitionV2,
  SetCredentialQuerySelection,
} from '../../utils/proof-request';
import { ProofPresentationProps } from './proof-presentation-props';
import TransactionRequestListItem from './transaction-request-list-item';

function selectCredential(
  setId: string,
  credentialQueryId: string,
  presentationDefinition: PresentationDefinitionV2 | undefined,
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
  credentialQuery: CredentialQuery | undefined,
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
      const userSelections = credentialSelections[0].userSelections?.filter(
        (path) => credentialAvailablePaths.includes(path),
      );
      newSelection[setId][credentialQueryId] = [
        {
          credentialId: selectedCredentialId,
          transactionDataIds: [],
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
          transactionDataIds: [],
          userSelections: userSelections?.filter((path) =>
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
  transactionSelectedCredentials: Record<string, string>,
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
        const transactionDataIds = Object.entries(
          transactionSelectedCredentials,
        )
          .filter(([_, selectedQueryId]) => selectedQueryId === requestQueryId)
          .map(([transactionId]) => transactionId);
        if (!acc[requestQueryId]) {
          acc[requestQueryId] = request.map((credentialRequest) => ({
            ...credentialRequest,
            transactionDataIds,
          }));
          return;
        }
        const requestArray = Array.isArray(request) ? request : [request];
        const currentRequest = acc[requestQueryId];
        requestArray.forEach((credentialRequest) => {
          let currentCredentialRequest:
            | PresentationSubmitV2CredentialRequest
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
            currentCredentialRequest.userSelections?.concat(
              credentialRequest.userSelections ?? [],
            ),
          );
          currentCredentialRequest.userSelections = userSelections;
          currentCredentialRequest.transactionDataIds = transactionDataIds;
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
  presentationDefinition: PresentationDefinitionV2 | undefined,
) {
  return requestGroup.reduce<CredentialQuerySelection>((acc, queryId) => {
    let preselection:
      | PresentationSubmitV2CredentialRequest
      | PresentationSubmitV2CredentialRequest[]
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
  const colorScheme = useAppColorScheme();
  const onImagePreview = useCredentialImagePreview();
  const { core } = useONECore();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck(false);
  const { expandedCredential, onHeaderPress, setInitialCredential } =
    useCredentialListExpandedCard();
  const sharingNavigation =
    useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const [transactionSelectedCredentials, setTransactionSelectedCredentials] =
    useState<Record<string, string>>({});
  const [selectedCredentials, setSelectedCredentials] =
    useState<SetCredentialQuerySelection>({});
  const [submitCredentials, setSubmitCredentials] =
    useState<CredentialQuerySelection>({});
  const [allSelectionsValid, setAllSelectionsValid] = useState(true);
  const language = useCurrentLanguage();

  const {
    request: { interactionId, proofId },
    selectedCredentials: updatedCredentialSelection,
    selectedTransactionCredential,
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

  const disclosurePolicyViolation = useMemo(
    () =>
      Object.values(selectedCredentials).some((selection) =>
        Object.entries(selection).some(([queryId, credentials]) => {
          const query = presentationDefinition?.credentialQueries[queryId];
          if (
            query?.credentialOrFailureHint.type_ !== 'APPLICABLE_CREDENTIALS'
          ) {
            return false;
          }
          return query.credentialOrFailureHint.applicableCredentials
            .filter(({ id }) =>
              credentials.some(({ credentialId }) => id === credentialId),
            )
            .some(({ embeddedDisclosurePolicyViolation }) =>
              Boolean(embeddedDisclosurePolicyViolation),
            );
        }),
      ),
    [selectedCredentials, presentationDefinition],
  );

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
    setTransactionSelectedCredentials(
      preselectTransactionCredentialsForPresentationDefinitionV2(
        presentationDefinition,
      ),
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

  const onTransactionDetails = (transactionId: string) => () => {
    if (!presentationDefinition) {
      return;
    }
    const allSelectedCredentials = Object.values(selectedCredentials).reduce(
      (acc, setSelections) => {
        Object.entries(setSelections).forEach(([queryId, querySelections]) => {
          const transactionDataIds = Object.entries(
            transactionSelectedCredentials,
          )
            .filter(([_, selectedQueryId]) => selectedQueryId === queryId)
            .map(([transactionId]) => transactionId);
          acc[queryId] = querySelections.map((querySelection) => ({
            ...querySelection,
            transactionDataIds,
          }));
        });
        return acc;
      },
      {} as CredentialQuerySelection,
    );
    sharingNavigation.navigate('TransactionDetails', {
      credentialQuerySelections: allSelectedCredentials,
      presentationDefinition,
      proofId,
      transactionId,
    });
  };

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

  const handleCredentialSelection = useCallback(
    (credentialQueryId: string, selectedCredentialIds: string[]) => {
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
    },
    [presentationDefinition?.credentialQueries, selectedCredentials],
  );

  // result of credential selection is propagated using the navigation param `selectedCredentials`
  useEffect(() => {
    if (!updatedCredentialSelection) {
      return;
    }
    sharingNavigation.setParams({ selectedCredentials: undefined });
    const { credentialQueryId, selectedCredentialIds } =
      updatedCredentialSelection;
    if (selectedCredentialIds.length === 0) {
      return;
    }
    handleCredentialSelection(credentialQueryId, selectedCredentialIds);
  }, [
    handleCredentialSelection,
    sharingNavigation,
    updatedCredentialSelection,
  ]);

  // result of transaction related selection is propagated using the navigation param `selectedTransactionCredential`
  useEffect(() => {
    if (!selectedTransactionCredential) {
      return;
    }
    sharingNavigation.setParams({ selectedTransactionCredential: undefined });
    const { credentialId, transactionId, queryId } =
      selectedTransactionCredential;
    setTransactionSelectedCredentials((previousValue) => ({
      ...previousValue,
      [transactionId]: queryId,
    }));
    handleCredentialSelection(queryId, [credentialId]);
  }, [
    handleCredentialSelection,
    selectedTransactionCredential,
    sharingNavigation,
  ]);

  const selectedCredentialsWithUpdatedSelection = (
    currentSelectedCredentials: SetCredentialQuerySelection,
    setId: string,
    requestQueryId: string,
    credentialId: CredentialListItem['id'],
    updatedFieldPath: PresentationDefinitionV2Claim['path'],
    selected: boolean,
  ) => {
    const set = currentSelectedCredentials[setId];
    const query = cloneDeep(set[requestQueryId]);
    const prevSelection = query.find((r) => r.credentialId === credentialId);
    if (!prevSelection) {
      return currentSelectedCredentials;
    }
    if (selected) {
      if (!prevSelection.userSelections) {
        prevSelection.userSelections = [updatedFieldPath];
      } else {
        prevSelection.userSelections.push(updatedFieldPath);
      }
    } else {
      prevSelection.userSelections = prevSelection.userSelections?.filter(
        (p) => p !== updatedFieldPath,
      );
    }
    return {
      ...currentSelectedCredentials,
      [setId]: {
        ...set,
        [requestQueryId]: query,
      },
    };
  };

  const onSelectField =
    (setId: string) =>
    (requestQueryId: string) =>
    (
      credentialId: CredentialListItem['id'],
      fieldPath: PresentationDefinitionV2Claim['path'],
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
      transactionSelectedCredentials,
    );

    setSubmitCredentials(credentials);
    setAllSelectionsValid(allSetsValid);
  }, [
    credentialSets,
    presentationDefinition,
    selectedCredentials,
    transactionSelectedCredentials,
  ]);

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
      {presentationDefinition.transactionData.length && (
        <ProofRequestSet
          headerLabel={translate('common.actionsToAuthorize')}
          showHeader={true}
        >
          <View style={styles.transactions}>
            {presentationDefinition.transactionData.map((transaction) => {
              const credentialQuery =
                presentationDefinition.credentialQueries[
                  transactionSelectedCredentials[transaction.id]
                ];
              const credential =
                credentialQuery?.credentialOrFailureHint.type_ ===
                'APPLICABLE_CREDENTIALS'
                  ? credentialQuery.credentialOrFailureHint
                      .applicableCredentials[0]
                  : undefined;
              return (
                <TouchableOpacity
                  key={transaction.id}
                  onPress={onTransactionDetails(transaction.id)}
                >
                  <TransactionRequestListItem
                    credential={credential}
                    transaction={transaction}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ProofRequestSet>
      )}
      {simpleSets.length ? (
        <ProofRequestSet
          headerLabel={translate('common.requestedCredentials')}
          showHeader={Boolean(presentationDefinition.transactionData.length)}
          showSeparator={false}
        >
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
                    language={language}
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
                    language={language}
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
        {disclosurePolicyViolation && (
          <View
            style={[
              styles.disclosureViolationWrapper,
              { backgroundColor: colorScheme.white },
            ]}
          >
            <StatusWarningIcon />
            <Typography
              color={colorScheme.text}
              preset="xs/line-height-small"
              style={styles.disclosureViolationText}
            >
              {translate('info.proofRequest.disclosurePolicyViolation.notice')}
            </Typography>
          </View>
        )}
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
  disclosureViolationText: {
    flexShrink: 1,
    marginLeft: 12,
  },
  disclosureViolationWrapper: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  requestedCredential: {
    marginBottom: 12,
  },
  requestedCredentialLast: {
    marginBottom: 0,
  },
  transactions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
});

export default ProofPresentationV2;
