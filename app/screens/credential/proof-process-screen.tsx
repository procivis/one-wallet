import {
  ButtonType,
  HISTORY_LIST_QUERY_KEY,
  LoaderViewState,
  PROOF_DETAIL_QUERY_KEY,
  reportException,
  useBlockOSBackNavigation,
  useONECore,
  useProofAccept,
  useProofDetail,
} from '@procivis/one-react-native-components';
import { Ubiqu } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Linking } from 'react-native';
import { useMutation, useQueryClient } from 'react-query';

import { ProcessingView } from '../../components/common/processing-view';
import { translate, translateError } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { CredentialQuerySelection } from '../../utils/proof-request';
import { isRSELockedError } from '../../utils/rse';

const { addEventListener: addRSEEventListener, PinEventType } = Ubiqu;

export const useProofAcceptV2 = () => {
  const queryClient = useQueryClient();
  const { core } = useONECore();

  return useMutation(
    async ({
      interactionId,
      credentials,
    }: {
      credentials: CredentialQuerySelection;
      interactionId: string;
    }) => core.holderSubmitProofV2(interactionId, credentials),
    {
      onError: async (err) => {
        reportException(err, 'Proof submission failure');
        await queryClient.invalidateQueries(PROOF_DETAIL_QUERY_KEY);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(PROOF_DETAIL_QUERY_KEY);
        await queryClient.invalidateQueries(HISTORY_LIST_QUERY_KEY);
      },
    },
  );
};

const ProofProcessScreen: FunctionComponent = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const route = useRoute<ShareCredentialRouteProp<'Processing'>>();
  const { interactionId, proofId, ...params } = route.params;
  const [state, setState] = useState<LoaderViewState>(
    LoaderViewState.InProgress,
  );
  const { mutateAsync: acceptProof } = useProofAccept();
  const { mutateAsync: acceptProofV2 } = useProofAcceptV2();
  const { data: proof } = useProofDetail(proofId);
  const [error, setError] = useState<unknown>();
  const accepted = useRef(false);

  useBlockOSBackNavigation();

  useEffect(() => {
    return addRSEEventListener((event) => {
      if (event.type === PinEventType.SHOW_PIN) {
        rootNavigation.navigate('RSESign');
      }
    });
  }, [rootNavigation]);

  const loaderLabel = useMemo(() => {
    if (error && isRSELockedError(error)) {
      return translate('info.proofRequest.process.error.rseLocked.title');
    }
    return translateError(
      error,
      translate(`proofRequestProcessTitle.${state}`),
    );
  }, [error, state]);

  const handleProofSubmit = useCallback(
    async (identifierId?: string) => {
      if (accepted.current) {
        return;
      }
      try {
        accepted.current = true;
        if ('credentials' in params) {
          const credentials = params.credentials;
          await acceptProof({
            credentials,
            identifierId,
            interactionId,
          });
        } else {
          const credentials = params.credentialsV2;
          await acceptProofV2({
            credentials,
            interactionId,
          });
        }
        setState(LoaderViewState.Success);
      } catch (e) {
        if (isRSELockedError(e)) {
          setState(LoaderViewState.Error);
        } else {
          setState(LoaderViewState.Warning);
        }
        setError(e);
      }
    },
    [params, acceptProof, interactionId, acceptProofV2],
  );

  useEffect(() => {
    if ('credentialsV2' in params) {
      handleProofSubmit();
    }
  }, [handleProofSubmit, params]);

  const closeButtonHandler = useCallback(() => {
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  const redirectUri = proof?.redirectUri;
  const redirectButtonHandler = useCallback(() => {
    if (!redirectUri) {
      return;
    }
    Linking.openURL(redirectUri)
      .then(closeButtonHandler)
      .catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
  }, [closeButtonHandler, redirectUri]);

  return (
    <ProcessingView
      button={
        state === LoaderViewState.Success && redirectUri
          ? {
              onPress: redirectButtonHandler,
              testID: 'ProofRequestAcceptProcessScreen.redirect',
              title: translate('common.backToService'),
              type: ButtonType.Primary,
            }
          : undefined
      }
      error={error}
      loaderLabel={loaderLabel}
      onClose={closeButtonHandler}
      secondaryButton={
        state === LoaderViewState.Success && redirectUri
          ? {
              onPress: closeButtonHandler,
              testID: 'ProofRequestAcceptProcessScreen.close',
              title: translate('common.close'),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      state={state}
      testID="ProofRequestAcceptProcessScreen"
      title={translate('common.shareCredential')}
    />
  );
};

export default ProofProcessScreen;
