import {
  ButtonProps,
  ButtonType,
  LoaderViewState,
  useBlockOSBackNavigation,
  useWalletUnitAttestation,
} from '@procivis/one-react-native-components';
import { WalletUnitStatusEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { config } from '../../config';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const WalletUnitErrorScreen: FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'WalletUnitError'>>();
  const [state, setState] = useState<
    LoaderViewState.Error | LoaderViewState.Warning
  >(LoaderViewState.Warning);
  const { data: walletUnitAttestation } = useWalletUnitAttestation();

  useEffect(() => {
    if (!walletUnitAttestation) {
      return;
    }
    if (walletUnitAttestation.status === WalletUnitStatusEnum.REVOKED) {
      setState(LoaderViewState.Error);
    }
  }, [walletUnitAttestation]);

  useBlockOSBackNavigation();

  const closeHandler = useCallback(() => {
    if (config.walletProvider.required) {
      return;
    }
    resetNavigationAction(rootNavigation, [
      { name: 'Dashboard', params: { screen: 'Wallet' } },
    ]);
  }, [rootNavigation]);

  const deleteWallet = useCallback(() => {
    rootNavigation.goBack();
    rootNavigation.navigate('Settings', { screen: 'DeleteWallet' });
  }, [rootNavigation]);

  const updateAttestation = useCallback(() => {
    rootNavigation.navigate('WalletUnitAttestation', { refresh: true });
  }, [rootNavigation]);

  const loaderLabel =
    state === LoaderViewState.Error
      ? translate('walletUnitAttestationError.revoked')
      : translate('walletUnitAttestationError.expired');

  const button: ButtonProps =
    state === LoaderViewState.Error
      ? {
          onPress: !config.walletProvider.required
            ? closeHandler
            : deleteWallet,
          title: !config.walletProvider.required
            ? translate('common.close')
            : translate('common.deleteWallet'),
          type: ButtonType.Primary,
        }
      : {
          onPress: updateAttestation,
          title: translate('common.update'),
          type: ButtonType.Primary,
        };

  const secondaryButton: ButtonProps | undefined =
    state === LoaderViewState.Warning
      ? {
          onPress: !config.walletProvider.required
            ? closeHandler
            : deleteWallet,
          title: !config.walletProvider.required
            ? translate('common.close')
            : translate('common.deleteWallet'),
          type: ButtonType.Secondary,
        }
      : undefined;

  return (
    <ProcessingView
      button={button}
      loaderLabel={loaderLabel}
      onClose={undefined}
      secondaryButton={secondaryButton}
      state={state}
      testID="WalletUnitErrorScreen"
      title={translate('common.walletAttestation')}
    />
  );
};

export default WalletUnitErrorScreen;
