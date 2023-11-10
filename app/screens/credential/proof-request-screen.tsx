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
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ONE, {
  CredentialStateEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from 'react-native-one-core';

import { ProofRequestCredential } from '../../components/proof-request/proof-request-credential';
import { ProofRequestGroup } from '../../components/proof-request/proof-request-group';
import { useCredentialRevocationCheck, useCredentials } from '../../hooks/credentials';
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
  const sharingNavigation = useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();

  useBlockOSBackNavigation();

  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();
  const { data: allCredentials } = useCredentials();

  const { request, selectedCredentialId } = route.params;
  const presentationDefinition = useMemoAsync(async () => {
    const definition = await ONE.getPresentationDefinition(request.proofId);

    // refresh revocation status of the applicable credentials
    const credentialIds = new Set<string>(
      definition.requestGroups.flatMap(({ requestedCredentials }) =>
        requestedCredentials.flatMap(({ applicableCredentials }) => applicableCredentials),
      ),
    );
    await checkRevocation(Array.from(credentialIds)).catch((e) => reportException(e, 'Revocation check failed'));

    return definition;
  }, [checkRevocation, request]);
  const proof = useMemoAsync(() => ONE.getProof(request.proofId), [request]);

  const [selectedCredentials, setSelectedCredentials] = useState<
    Record<PresentationDefinitionRequestedCredential['id'], PresentationSubmitCredentialRequest | undefined>
  >({});

  // initial selection of credentials/claims
  useEffect(() => {
    if (!presentationDefinition || !allCredentials) return;

    const preselected: Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest | undefined
    > = {};
    presentationDefinition.requestGroups.forEach((group) =>
      group.requestedCredentials.forEach((credential) => {
        const credentialId =
          allCredentials.find(
            ({ id, state }) => state === CredentialStateEnum.ACCEPTED && credential.applicableCredentials.includes(id),
          )?.id || credential.applicableCredentials[0];
        if (!credentialId) {
          preselected[credential.id] = undefined;
          return;
        }

        const requiredClaims = credential.fields.filter((field) => field.required).map((field) => field.id);
        preselected[credential.id] = { credentialId, submitClaims: requiredClaims };
      }),
    );

    setSelectedCredentials(preselected);
  }, [presentationDefinition, allCredentials]);

  const [activeSelection, setActiveSelection] = useState<PresentationDefinitionRequestedCredential['id']>();
  const onSelectCredential = useCallback(
    (requestCredentialId: PresentationDefinitionRequestedCredential['id']) => () => {
      const requestedCredential = presentationDefinition?.requestGroups[0].requestedCredentials.find(
        (credential) => credential.id === requestCredentialId,
      ) as PresentationDefinitionRequestedCredential;

      setActiveSelection(requestCredentialId);
      sharingNavigation.navigate('SelectCredential', {
        preselectedCredentialId: selectedCredentials[requestCredentialId]?.credentialId as string,
        request: requestedCredential,
      });
    },
    [sharingNavigation, presentationDefinition, selectedCredentials],
  );
  // result of selection is propagated using the navigation param `selectedCredentialId`
  useEffect(() => {
    if (selectedCredentialId && activeSelection) {
      setSelectedCredentials((prev) => {
        const prevSelection = prev[activeSelection] as PresentationSubmitCredentialRequest;
        return {
          ...prev,
          [activeSelection]: { ...prevSelection, credentialId: selectedCredentialId },
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
          const prevSelection = prev[requestCredentialId] as PresentationSubmitCredentialRequest;
          let submitClaims = [...prevSelection.submitClaims];
          if (selected) {
            submitClaims.push(id);
          } else {
            submitClaims = submitClaims.filter((claimId) => claimId !== id);
          }
          return { ...prev, [requestCredentialId]: { ...prevSelection, submitClaims } };
        });
      },
    [],
  );

  const onReject = useCallback(() => {
    ONE.holderRejectProof(request.interactionId).catch((e) => reportException(e, 'Reject Proof failure'));
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation, request]);

  const onSubmit = useCallback(() => {
    sharingNavigation.navigate('Processing', {
      interactionId: request.interactionId,
      credentials: selectedCredentials as Record<string, PresentationSubmitCredentialRequest>,
    });
  }, [sharingNavigation, request, selectedCredentials]);

  const allSelectionsValid =
    presentationDefinition &&
    Object.values(selectedCredentials).every(
      (selection) =>
        selection?.credentialId &&
        allCredentials?.some(
          ({ id, state }) => id === selection.credentialId && state === CredentialStateEnum.ACCEPTED,
        ),
    );

  return (
    <SharingScreen
      testID="ProofRequestSharingScreen"
      variation={SharingScreenVariation.Neutral}
      title={translate('proofRequest.title')}
      cancelLabel={translate('common.cancel')}
      onCancel={onReject}
      submitLabel={translate('proofRequest.confirm')}
      onSubmit={allSelectionsValid ? onSubmit : undefined}
      header={
        <View style={styles.header}>
          <Typography size="sml" bold={true} caps={true} style={styles.headerLabel} accessibilityRole="header">
            {translate('proofRequest.verifier')}
          </Typography>
          <Typography color={colorScheme.text}>{proof?.verifierDid}</Typography>
        </View>
      }>
      {!presentationDefinition || !allCredentials ? (
        <ActivityIndicator />
      ) : (
        presentationDefinition.requestGroups.map((group, index, { length }) => (
          <ProofRequestGroup key={group.id} request={group} last={length === index + 1}>
            {group.requestedCredentials.map((credential, credentialIndex, { length: credentialsLength }) => (
              <ProofRequestCredential
                testID={concatTestID('ProofRequestSharingScreen.credential', credential.id)}
                style={[
                  styles.requestedCredential,
                  credentialsLength === credentialIndex + 1 && styles.requestedCredentialLast,
                ]}
                key={credential.id}
                request={credential}
                allCredentials={allCredentials}
                selectedCredentialId={selectedCredentials[credential.id]?.credentialId}
                onSelectCredential={onSelectCredential(credential.id)}
                selectedFields={selectedCredentials[credential.id]?.submitClaims}
                onSelectField={onSelectField(credential.id)}
              />
            ))}
          </ProofRequestGroup>
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
