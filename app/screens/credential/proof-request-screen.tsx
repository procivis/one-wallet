import {
  ActivityIndicator,
  concatTestID,
  SharingScreen,
  SharingScreenVariation,
  Typography,
  useAppColorScheme,
  useBlockOSBackNavigation,
  useMemoAsync,
} from '@procivis/react-native-components';
import {
  CredentialStateEnum,
  OneError,
  OneErrorCode,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { CredentialSelect } from '../../components/proof-request/credential-select';
import { Group } from '../../components/proof-request/group';
import { useONECore } from '../../hooks/core-context';
import {
  useCredentialRevocationCheck,
  useCredentials,
} from '../../hooks/credentials';
import { useProofDetail, useProofReject } from '../../hooks/proofs';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

const ProofRequestScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp<'ShareCredential'>>();
  const sharingNavigation =
    useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const { core } = useONECore();

  useBlockOSBackNavigation();

  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();
  const { data: allCredentials } = useCredentials();

  const {
    request: { interactionId, proofId },
    selectedCredentialId,
  } = route.params;

  const { mutateAsync: rejectProof } = useProofReject();
  const { data: proof } = useProofDetail(proofId);

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

  const onReject = useCallback(() => {
    rejectProof(interactionId).catch((err) => {
      if (
        !(err instanceof OneError) ||
        err.code !== OneErrorCode.NotSupported
      ) {
        reportException(err, 'Reject Proof failure');
      }
    });
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [interactionId, rejectProof, rootNavigation]);

  const onSubmit = useCallback(() => {
    sharingNavigation.navigate('Processing', {
      credentials: selectedCredentials as Record<
        string,
        PresentationSubmitCredentialRequest
      >,
      interactionId: interactionId,
      proofId,
    });
  }, [interactionId, proofId, selectedCredentials, sharingNavigation]);

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
    <SharingScreen
      cancelLabel={translate('common.cancel')}
      header={
        <View style={styles.header}>
          <Typography
            accessibilityRole="header"
            bold={true}
            caps={true}
            size="sml"
            style={styles.headerLabel}
          >
            {translate('proofRequest.verifier')}
          </Typography>
          <Typography
            color={colorScheme.text}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {proof?.verifierDid}
          </Typography>
        </View>
      }
      onCancel={onReject}
      onSubmit={allSelectionsValid ? onSubmit : undefined}
      submitLabel={translate('proofRequest.confirm')}
      testID="ProofRequestSharingScreen"
      title={translate('proofRequest.title')}
      variation={SharingScreenVariation.Neutral}
    >
      {!presentationDefinition || !allCredentials ? (
        <ActivityIndicator />
      ) : (
        presentationDefinition.requestGroups.map((group, index, { length }) => (
          <Group key={group.id} last={length === index + 1} request={group}>
            {group.requestedCredentials.map(
              (credential, credentialIndex, { length: credentialsLength }) => (
                <CredentialSelect
                  allCredentials={allCredentials}
                  key={credential.id}
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
        ))
      )}
    </SharingScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 12,
  },
  headerLabel: {
    marginBottom: 4,
  },
  requestedCredential: {
    marginBottom: 24,
  },
  requestedCredentialLast: {
    marginBottom: 0,
  },
});

export default ProofRequestScreen;
