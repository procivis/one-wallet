import {
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  EntityDetails,
  ProofRequestGroup,
  ScrollViewScreen,
  ShareCredential,
  useBeforeRemove,
  useCredentialListExpandedCard,
  useCredentialRevocationCheck,
  useCredentials,
  useMemoAsync,
  useONECore,
  useProofDetail,
  useProofReject,
  useTrustEntity,
} from '@procivis/one-react-native-components';
import {
  CredentialStateEnum,
  PresentationDefinition,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
  TrustEntityRoleEnum,
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
import ShareDisclaimer from '../../components/share/share-disclaimer';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { shareCredentialLabels } from '../../utils/credential-sharing';
import { preselectCredentialsForRequestGroups } from '../../utils/proof-request';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';

const isCredentialApplicable = (
  presentationDefinition: PresentationDefinition,
  requestedCredentialId: string,
  selectedCredentialId: string,
) => {
  return presentationDefinition.requestGroups
    .find((group) =>
      group.requestedCredentials.find(
        (credential) => credential.id === requestedCredentialId,
      ),
    )
    ?.requestedCredentials.find(
      (credential) => credential.id === requestedCredentialId,
    )
    ?.applicableCredentials.includes(selectedCredentialId);
};

const ProofRequestScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const sharingNavigation =
    useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const onImagePreview = useCredentialImagePreview();
  const { core } = useONECore();
  const { mutateAsync: rejectProof } = useProofReject();
  const isFocused = useIsFocused();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();
  const { data: allCredentials } = useCredentials();
  const {
    request: { interactionId, proofId },
    selectedCredentialId,
  } = route.params;
  const { data: proof } = useProofDetail(proofId);
  const { data: trustEntity } = useTrustEntity(proof?.verifierDid?.id);
  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();

  // If this is true, we should not attempt to reject in useBeforeRemove
  const proofAccepted = useRef<boolean>(false);

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
    await checkRevocation(Array.from(credentialIds));

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

    setSelectedCredentials(
      preselectCredentialsForRequestGroups(
        presentationDefinition.requestGroups,
        allCredentials,
      ),
    );
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
    if (!isFocused || proofAccepted.current) {
      return;
    }
    rejectProof(interactionId);
  }, [interactionId, isFocused, rejectProof]);

  const onSubmit = useCallback(() => {
    proofAccepted.current = true;
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
    Object.entries(selectedCredentials).every(
      ([requestedCredentialId, selection]) =>
        selection?.credentialId &&
        isCredentialApplicable(
          presentationDefinition,
          requestedCredentialId,
          selection.credentialId,
        ) &&
        allCredentials?.some(
          ({ id, state }) =>
            id === selection.credentialId &&
            state === CredentialStateEnum.ACCEPTED,
        ),
    ) &&
    Object.values(selectedCredentials).flatMap(
      (credential) => credential?.submitClaims ?? [],
    ).length > 0;

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderCloseModalButton testID="ProofRequestSharingScreen.header.close" />
        ),
        rightItem: (
          <HeaderInfoButton
            onPress={infoPressHandler}
            testID="ProofRequestSharingScreen.header.info"
          />
        ),
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
        <EntityDetails
          did={proof?.verifierDid}
          labels={trustEntityDetailsLabels(TrustEntityRoleEnum.VERIFIER)}
          role={TrustEntityRoleEnum.VERIFIER}
          style={styles.verifier}
          testID="EntityDetail"
        />
        {!presentationDefinition || !allCredentials ? (
          <ActivityIndicator
            animate={isFocused}
            testID="ProofRequestSharingScreen.indicator.credentials"
          />
        ) : (
          <>
            {presentationDefinition.requestGroups.map((group) => (
              <ProofRequestGroup key={group.id}>
                {group.requestedCredentials.map(
                  (
                    credential,
                    credentialIndex,
                    { length: credentialsLength },
                  ) => (
                    <ShareCredential
                      allCredentials={allCredentials}
                      credentialId={credential.id}
                      expanded={expandedCredential === credential.id}
                      key={credential.id}
                      labels={shareCredentialLabels()}
                      lastItem={credentialIndex === credentialsLength - 1}
                      onHeaderPress={onHeaderPress}
                      onImagePreview={onImagePreview}
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
              </ProofRequestGroup>
            ))}
            <View style={styles.bottom}>
              <Button
                disabled={!allSelectionsValid}
                onPress={onSubmit}
                testID="ProofRequestSharingScreen.shareButton"
                title={translate('proofRequest.confirm')}
                type={
                  allSelectionsValid ? ButtonType.Primary : ButtonType.Secondary
                }
              />
            </View>
            <ShareDisclaimer
              action={translate('common.share')}
              ppUrl={trustEntity?.privacyUrl}
              testID="ProofRequestSharingScreen.disclaimer"
              tosUrl={trustEntity?.termsUrl}
            />
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
