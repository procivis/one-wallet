import {
  ActivityIndicator,
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
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
  PresentationSubmitCredentialRequest,
} from 'react-native-one-core';

import { ProofRequestCredential } from '../../components/proof-request/proof-request-credential';
import { ProofRequestGroup } from '../../components/proof-request/proof-request-group';
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

  const { request, selectedCredentialId } = route.params;
  const presentationDefintion = useMemoAsync(() => ONE.getPresentationDefinition(request.proofId), [request]);
  const proof = useMemoAsync(() => ONE.getProof(request.proofId), [request]);

  const [selectedCredentials, setSelectedCredentials] = useState<
    Record<PresentationDefinitionRequestedCredential['id'], PresentationSubmitCredentialRequest | undefined>
  >({});

  // initial selection of credentials/claims
  useEffect(() => {
    if (!presentationDefintion) return;

    const preselected: Record<
      PresentationDefinitionRequestedCredential['id'],
      PresentationSubmitCredentialRequest | undefined
    > = {};
    presentationDefintion.requestGroups.forEach((group) =>
      group.requestedCredentials.forEach((credential) => {
        const credentialId = credential.applicableCredentials[0];
        if (!credentialId) {
          preselected[credential.id] = undefined;
          return;
        }

        const requiredClaims = credential.fields.filter((field) => field.required).map((field) => field.id);
        preselected[credential.id] = { credentialId, submitClaims: requiredClaims };
      }),
    );

    setSelectedCredentials(preselected);
  }, [presentationDefintion]);

  const [activeSelection, setActiveSelection] = useState<PresentationDefinitionRequestedCredential['id']>();
  const onSelectCredential = useCallback(
    (requestCredentialId: PresentationDefinitionRequestedCredential['id']) => () => {
      const requestedCredential = presentationDefintion?.requestGroups[0].requestedCredentials.find(
        (credential) => credential.id === requestCredentialId,
      ) as PresentationDefinitionRequestedCredential;

      setActiveSelection(requestCredentialId);
      sharingNavigation.navigate('SelectCredential', {
        preselectedCredentialId: selectedCredentials[requestCredentialId]?.credentialId as string,
        request: requestedCredential,
      });
    },
    [sharingNavigation, presentationDefintion, selectedCredentials],
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
    presentationDefintion && Object.values(selectedCredentials).every((selection) => selection?.credentialId);

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
      {!presentationDefintion ? (
        <ActivityIndicator />
      ) : (
        presentationDefintion.requestGroups.map((group, index, { length }) => (
          <ProofRequestGroup key={group.id} request={group} last={length === index + 1}>
            {group.requestedCredentials.map((credential) => (
              <ProofRequestCredential
                key={credential.id}
                request={credential}
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
});

export default ProofRequestScreen;
