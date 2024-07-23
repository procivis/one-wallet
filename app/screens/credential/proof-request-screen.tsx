import {
  Button,
  concatTestID,
  EntityCluster,
  ScrollViewScreen,
  useMemoAsync,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import {
  CredentialStateEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { CredentialSelect } from '../../components/proof-request/credential-select';
import { Group } from '../../components/proof-request/group';
import { useONECore } from '../../hooks/core/core-context';
import {
  useCredentialRevocationCheck,
  useCredentials,
} from '../../hooks/core/credentials';
import { useProofDetail, useProofReject } from '../../hooks/core/proofs';
import { useCredentialListExpandedCard } from '../../hooks/credential-card/credential-card-expanding';
import { useBeforeRemove } from '../../hooks/navigation/before-remove';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

const ProofRequestScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const sharingNavigation =
    useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const isFocused = useIsFocused();
  const { core } = useONECore();

  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();
  const { data: allCredentials } = useCredentials();

  const {
    request: { interactionId, proofId },
    selectedCredentialId,
  } = route.params;

  const { mutateAsync: rejectProof } = useProofReject();
  const { data: proof } = useProofDetail(proofId);

  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();

  const presentationDefinition = useMemoAsync(async () => {
    const definition = await core.getPresentationDefinition(proofId);

    // refresh revocation status of the applicable credentials
    const credentialIds = new Set<string>(
      definition.requestGroups.flatMap(({ requestedCredentials }) =>
        requestedCredentials.flatMap(
          ({ applicableCredentials }) => applicableCredentials,
        ),
      ),
    );
    await checkRevocation(Array.from(credentialIds)).catch((e) =>
      reportException(e, 'Revocation check failed'),
    );

    return definition;
  }, [checkRevocation, core, proofId]);

  const [selectedCredentials, setSelectedCredentials] = useState<
    Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest | undefined
    >
  >({});

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: {
        proofId,
      },
      screen: 'ProofNerdMode',
    });
  }, [proofId, rootNavigation]);

  // initial selection of credentials/claims
  useEffect(() => {
    if (!presentationDefinition || !allCredentials) {
      return;
    }

    const preselected: Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest | undefined
    > = {};
    presentationDefinition.requestGroups.forEach((group) =>
      group.requestedCredentials.forEach((credential) => {
        const credentialId =
          allCredentials.find(
            ({ id, state }) =>
              state === CredentialStateEnum.ACCEPTED &&
              credential.applicableCredentials.includes(id),
          )?.id ?? credential.applicableCredentials[0];
        if (!credentialId) {
          preselected[credential.id] = undefined;
          return;
        }

        const requiredClaims = credential.fields
          .filter((field) => field.required)
          .map((field) => field.id);
        preselected[credential.id] = {
          credentialId,
          submitClaims: requiredClaims,
        };
      }),
    );

    setSelectedCredentials(preselected);
  }, [presentationDefinition, allCredentials]);

  // by default the first credential is expanded
  const initialExpansionPerformed = useRef(false);
  useEffect(() => {
    const firstCredentialId =
      presentationDefinition?.requestGroups[0]?.requestedCredentials[0]?.id;
    if (
      !expandedCredential &&
      firstCredentialId &&
      !initialExpansionPerformed.current
    ) {
      initialExpansionPerformed.current = true;
      onHeaderPress(firstCredentialId);
    }
  }, [expandedCredential, presentationDefinition, onHeaderPress]);

  const [activeSelection, setActiveSelection] =
    useState<PresentationDefinitionRequestedCredential['id']>();
  const onSelectCredential = useCallback(
    (requestCredentialId: PresentationDefinitionRequestedCredential['id']) =>
      () => {
        const requestedCredential =
          presentationDefinition?.requestGroups[0].requestedCredentials.find(
            (credential) => credential.id === requestCredentialId,
          ) as PresentationDefinitionRequestedCredential;

        setActiveSelection(requestCredentialId);
        sharingNavigation.navigate('SelectCredential', {
          preselectedCredentialId: selectedCredentials[requestCredentialId]
            ?.credentialId as string,
          request: requestedCredential,
        });
      },
    [sharingNavigation, presentationDefinition, selectedCredentials],
  );
  // result of selection is propagated using the navigation param `selectedCredentialId`
  useEffect(() => {
    if (selectedCredentialId && activeSelection) {
      setSelectedCredentials((prev) => {
        const prevSelection = prev[
          activeSelection
        ] as PresentationSubmitCredentialRequest;
        return {
          ...prev,
          [activeSelection]: {
            ...prevSelection,
            credentialId: selectedCredentialId,
          },
        };
      });
    }
    // ignore activeSelection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCredentialId]);

  const onSelectField = useCallback(
    (requestCredentialId: PresentationDefinitionRequestedCredential['id']) =>
      (id: PresentationDefinitionField['id'], selected: boolean) => {
        setSelectedCredentials((prev) => {
          const prevSelection = prev[
            requestCredentialId
          ] as PresentationSubmitCredentialRequest;
          let submitClaims = [...prevSelection.submitClaims];
          if (selected) {
            submitClaims.push(id);
          } else {
            submitClaims = submitClaims.filter((claimId) => claimId !== id);
          }
          return {
            ...prev,
            [requestCredentialId]: { ...prevSelection, submitClaims },
          };
        });
      },
    [],
  );

  const reject = useCallback(() => {
    if (!isFocused) {
      return;
    }
    rejectProof(interactionId).catch((err) => {
      reportException(err, 'Reject Proof failure');
    });
  }, [interactionId, isFocused, rejectProof]);

  const onSubmit = useCallback(() => {
    sharingNavigation.replace('Processing', {
      credentials: selectedCredentials as Record<
        string,
        PresentationSubmitCredentialRequest
      >,
      interactionId: interactionId,
      proofId,
    });
  }, [interactionId, proofId, selectedCredentials, sharingNavigation]);

  useBeforeRemove(reject);

  const allSelectionsValid =
    presentationDefinition &&
    Object.values(selectedCredentials).every(
      (selection) =>
        selection?.credentialId &&
        allCredentials?.some(
          ({ id, state }) =>
            id === selection.credentialId &&
            state === CredentialStateEnum.ACCEPTED,
        ),
    );

  return (
    <ScrollViewScreen
      header={{
        leftItem: HeaderCloseModalButton,
        rightItem: <HeaderInfoButton onPress={infoPressHandler} />,
        static: true,
        title: translate('proofRequest.title'),
      }}
      modalPresentation
      scrollView={{
        testID: 'ProofRequestSharingScreen.scroll',
      }}
      testID="ProofRequestSharingScreen"
    >
      <View style={styles.content} testID="ProofRequestSharingScreen.content">
        <EntityCluster
          entityName={
            proof?.verifierDid ?? translate('proofRequest.unknownVerifier')
          }
          style={styles.verifier}
        />
        {!presentationDefinition || !allCredentials ? (
          <ActivityIndicator />
        ) : (
          <>
            {presentationDefinition.requestGroups.map(
              (group, index, { length }) => (
                <Group
                  key={group.id}
                  last={length === index + 1}
                  request={group}
                >
                  {group.requestedCredentials.map(
                    (
                      credential,
                      credentialIndex,
                      { length: credentialsLength },
                    ) => (
                      <CredentialSelect
                        allCredentials={allCredentials}
                        credentialId={credential.id}
                        expanded={expandedCredential === credential.id}
                        key={credential.id}
                        lastItem={credentialIndex === credentialsLength - 1}
                        onHeaderPress={onHeaderPress}
                        onSelectCredential={onSelectCredential(credential.id)}
                        onSelectField={onSelectField(credential.id)}
                        request={credential}
                        selectedCredentialId={
                          selectedCredentials[credential.id]?.credentialId
                        }
                        selectedFields={
                          selectedCredentials[credential.id]?.submitClaims
                        }
                        style={[
                          styles.requestedCredential,
                          credentialsLength === credentialIndex + 1 &&
                            styles.requestedCredentialLast,
                        ]}
                        testID={concatTestID(
                          'ProofRequestSharingScreen.credential',
                          credential.id,
                        )}
                      />
                    ),
                  )}
                </Group>
              ),
            )}
            <View style={styles.bottom}>
              <Button
                disabled={!allSelectionsValid}
                onPress={onSubmit}
                testID="ProofRequestSharingScreen.shareButton"
                title={translate('proofRequest.confirm')}
              />
            </View>
          </>
        )}
      </View>
    </ScrollViewScreen>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  requestedCredential: {
    marginBottom: 12,
  },
  requestedCredentialLast: {
    marginBottom: 0,
  },
  verifier: {
    paddingHorizontal: 0,
    paddingTop: 16,
  },
});

export default ProofRequestScreen;
