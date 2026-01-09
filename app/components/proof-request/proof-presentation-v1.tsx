import {
  Button,
  ButtonType,
  concatTestID,
  ProofRequestGroup,
  ShareCredential,
  useCredentialListExpandedCard,
  useCredentialRevocationCheck,
  useMemoAsync,
  useONECore,
} from '@procivis/one-react-native-components';
import {
  CredentialStateBindingEnum,
  PresentationDefinitionBindingDto,
  PresentationDefinitionFieldBindingDto,
  PresentationDefinitionRequestedCredentialBindingDto,
  PresentationSubmitCredentialRequestBindingDto,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import { uniq } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { shareCredentialLabels } from '../../utils/credential-sharing';
import {
  getFullyNestedFields,
  preselectCredentialsForRequestGroups,
} from '../../utils/proof-request';
import { ProofPresentationProps } from './proof-presentation-props';

function getNewlySelectedClaims(
  presentationDefinition: PresentationDefinitionBindingDto | undefined,
  selectedCredentialId: string,
  previouslySelectedClaims: string[],
) {
  const requestedCredential = presentationDefinition?.requestGroups
    .find((group) =>
      group.requestedCredentials.find((cred) =>
        cred.applicableCredentials.includes(selectedCredentialId),
      ),
    )
    ?.requestedCredentials.find((cred) =>
      cred.applicableCredentials.includes(selectedCredentialId),
    );
  const filteredPrevSelection = previouslySelectedClaims.filter((id) =>
    requestedCredential?.fields.find(
      (field) =>
        field.id === id &&
        Object.keys(field.keyMap).includes(selectedCredentialId),
    ),
  );
  const fullyNestedFieldIds = getFullyNestedFields(
    requestedCredential?.fields ?? [],
    selectedCredentialId,
  ).map((field) => field.id);
  return uniq(filteredPrevSelection.concat(fullyNestedFieldIds));
}

const ProofPresentationV1: FC<ProofPresentationProps> = ({
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
  const [activeCredentialSelection, setActiveCredentialSelection] =
    useState<PresentationDefinitionRequestedCredentialBindingDto['id']>();
  const [selectedCredentials, setSelectedCredentials] = useState<
    Record<string, PresentationSubmitCredentialRequestBindingDto | undefined>
  >({});

  const {
    request: { interactionId, proofId },
    selectedCredentialId,
  } = route.params;

  const presentationDefinition = useMemoAsync(async () => {
    const definition = await core.getPresentationDefinition(proofId);

    onPresentationDefinitionLoaded();

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

  // initial selection of credentials/claims
  useEffect(() => {
    if (!presentationDefinition) {
      return;
    }

    setSelectedCredentials(
      preselectCredentialsForRequestGroups(
        presentationDefinition.requestGroups,
        presentationDefinition.credentials,
      ),
    );
  }, [presentationDefinition, setSelectedCredentials]);

  useEffect(() => {
    const firstCredentialId =
      presentationDefinition?.requestGroups[0]?.requestedCredentials[0]?.id;
    if (firstCredentialId) {
      setInitialCredential(firstCredentialId);
    }
  }, [presentationDefinition, setInitialCredential]);

  const onSelectCredential =
    (
      requestCredentialId: PresentationDefinitionRequestedCredentialBindingDto['id'],
    ) =>
    () => {
      const requestedCredential =
        presentationDefinition?.requestGroups[0].requestedCredentials.find(
          (credential) => credential.id === requestCredentialId,
        ) as PresentationDefinitionRequestedCredentialBindingDto;

      setActiveCredentialSelection(requestCredentialId);
      sharingNavigation.navigate('SelectCredential', {
        preselectedCredentialId: selectedCredentials[requestCredentialId]
          ?.credentialId as string,
        request: requestedCredential,
      });
    };

  // result of selection is propagated using the navigation param `selectedCredentialId`
  useEffect(() => {
    if (selectedCredentialId && activeCredentialSelection) {
      setSelectedCredentials((prev) => {
        const prevSelection = prev[
          activeCredentialSelection
        ] as PresentationSubmitCredentialRequestBindingDto;
        prevSelection.submitClaims = getNewlySelectedClaims(
          presentationDefinition,
          selectedCredentialId,
          prevSelection.submitClaims,
        );
        return {
          ...prev,
          [activeCredentialSelection]: {
            ...prevSelection,
            credentialId: selectedCredentialId,
          },
        };
      });
    }
    // ignore activeSelection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCredentialId]);

  const selectedCredentialsWithUpdatedSelection = (
    currentSelectedCredentials: Record<
      string,
      PresentationSubmitCredentialRequestBindingDto | undefined
    >,
    updatedCredentialId: PresentationDefinitionRequestedCredentialBindingDto['id'],
    updatedFieldId: PresentationDefinitionFieldBindingDto['id'],
    selected: boolean,
  ) => {
    const prevSelection = currentSelectedCredentials[
      updatedCredentialId
    ] as PresentationSubmitCredentialRequestBindingDto;
    let submitClaims = [...prevSelection.submitClaims];
    if (selected) {
      submitClaims.push(updatedFieldId);
    } else {
      submitClaims = submitClaims.filter(
        (claimId) => claimId !== updatedFieldId,
      );
    }
    return {
      ...currentSelectedCredentials,
      [updatedCredentialId]: { ...prevSelection, submitClaims },
    };
  };

  const onSelectField = useCallback(
    (
        requestCredentialId: PresentationDefinitionRequestedCredentialBindingDto['id'],
      ) =>
      (
        fieldId: PresentationDefinitionFieldBindingDto['id'],
        selected: boolean,
      ) => {
        setSelectedCredentials((current) => {
          return selectedCredentialsWithUpdatedSelection(
            current,
            requestCredentialId,
            fieldId,
            selected,
          );
        });
      },
    [setSelectedCredentials],
  );

  const onSubmit = useCallback(() => {
    proofAccepted.current = true;
    sharingNavigation.replace('Processing', {
      credentials: Object.entries(selectedCredentials).reduce<
        Record<string, PresentationSubmitCredentialRequestBindingDto[]>
      >((aggr, [key, value]) => {
        if (!value) {
          return aggr;
        }
        return { [key]: [value], ...aggr };
      }, {}),
      interactionId,
      proofId,
    });
  }, [
    interactionId,
    proofAccepted,
    proofId,
    selectedCredentials,
    sharingNavigation,
  ]);

  const isCredentialApplicable = (
    presentationDefinition: PresentationDefinitionBindingDto,
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
        presentationDefinition.credentials.some(
          ({ id, state }) =>
            id === selection.credentialId &&
            state === CredentialStateBindingEnum.ACCEPTED,
        ),
    ) &&
    Object.values(selectedCredentials).flatMap(
      (credential) => credential?.submitClaims ?? [],
    ).length > 0;

  if (!presentationDefinition) {
    return null;
  }

  return (
    <>
      {presentationDefinition.requestGroups.map((group) => (
        <ProofRequestGroup key={group.id}>
          {group.requestedCredentials.map(
            (
              credentialRequest,
              credentialRequestIndex,
              { length: credentialRequestsLength },
            ) => {
              const lastItem =
                credentialRequestIndex === credentialRequestsLength - 1;
              const selected = selectedCredentials[credentialRequest.id];
              return (
                <ShareCredential
                  allCredentials={presentationDefinition.credentials}
                  expanded={expandedCredential === credentialRequest.id}
                  key={credentialRequest.id}
                  labels={shareCredentialLabels()}
                  lastItem={lastItem}
                  onHeaderPress={onHeaderPress}
                  onImagePreview={onImagePreview}
                  onSelectCredential={onSelectCredential(credentialRequest.id)}
                  onSelectField={onSelectField(credentialRequest.id)}
                  request={credentialRequest}
                  selectedCredentialId={selected?.credentialId}
                  selectedFields={selected?.submitClaims}
                  style={[
                    styles.requestedCredential,
                    lastItem && styles.requestedCredentialLast,
                  ]}
                  testID={concatTestID(
                    'ProofRequestSharingScreen.credential',
                    credentialRequest.id,
                  )}
                />
              );
            },
          )}
        </ProofRequestGroup>
      ))}
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

export default ProofPresentationV1;
