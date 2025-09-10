import {
  LoaderViewState,
  Transport,
  useAvailableTransports,
  useONECore,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-query';

import { ProcessingView } from '../../components/common/processing-view';
import { config } from '../../config';
import { translate, translateError } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const testID = 'WalletUnitAttestationScreen';

export const useRegisterHolder = () => {
  const { core, organisationId } = useONECore();
  const { walletStore } = useStores();

  return useMutation(async () => {
    const result = await core.holderRegisterWalletUnit({
      keyType: 'ECDSA',
      organisationId,
      walletProvider: config.walletProvider,
    });

    // Store the attestation key ID in the wallet store
    walletStore.updateAttestationKeyId(result.keyId);

    return result;
  }, {});
};

const WalletUnitAttestationScreen = () => {
  const [error, setError] = useState<unknown>();
  const [status, setStatus] = useState<
    | LoaderViewState.InProgress
    | LoaderViewState.Warning
    | LoaderViewState.Error
    | LoaderViewState.Success
  >(LoaderViewState.InProgress);
  const { availableTransport } = useAvailableTransports([Transport.HTTP]);
  const hasInternetConnection = availableTransport?.includes(Transport.HTTP);

  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
  const { mutateAsync: registerHolder } = useRegisterHolder();

  const goToDashboard = useCallback(() => {
    resetNavigationAction(rootNavigation, [
      { name: 'Dashboard', params: { screen: 'Wallet' } },
    ]);
  }, [rootNavigation]);

  const handleRegisterHolder = useCallback(async () => {
    if (!hasInternetConnection) {
      setStatus(LoaderViewState.Warning);
      return;
    }
    try {
      setStatus(LoaderViewState.InProgress);
      await registerHolder();
      setStatus(LoaderViewState.Success);
      goToDashboard();
    } catch (err) {
      setStatus(LoaderViewState.Error);
      setError(err);
    }
  }, [goToDashboard, hasInternetConnection, registerHolder]);

  useEffect(() => {
    handleRegisterHolder();
  }, [handleRegisterHolder]);

  const handleRetry = useCallback(() => {
    handleRegisterHolder();
  }, [handleRegisterHolder]);

  return (
    <ProcessingView
      button={
        status === LoaderViewState.Warning && {
          onPress: handleRetry,
          testID: 'CredentialAcceptProcessScreen.redirect',
          title: translate('common.retry'),
        }
      }
      error={error}
      loaderLabel={translateError(
        error,
        translate(`walletUnitAttestation.${status}`),
      )}
      onClose={config.walletProvider.required ? undefined : goToDashboard}
      state={status}
      testID={testID}
      title={translate('common.walletUnitRequest')}
    />
  );
};

export default memo(WalletUnitAttestationScreen);
