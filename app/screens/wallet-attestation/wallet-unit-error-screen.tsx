import {
  ButtonProps,
  ButtonType,
  LoaderViewState,
  useBlockOSBackNavigation,
  useWalletUnitDetail,
} from '@procivis/one-react-native-components';
import { WalletUnitStatus } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

const WalletUnitErrorScreen: FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'WalletUnitError'>>();
  const [state, setState] = useState<
    LoaderViewState.Error | LoaderViewState.Warning
  >(LoaderViewState.Warning);
  const {
    walletStore: { walletProvider, walletUnitId },
  } = useStores();
  const { data: walletUnitDetail } = useWalletUnitDetail(walletUnitId);

  useEffect(() => {
    if (!walletUnitDetail) {
      return;
    }
    if (walletUnitDetail.status === WalletUnitStatus.REVOKED) {
      setState(LoaderViewState.Error);
    }
  }, [walletUnitDetail]);

  useBlockOSBackNavigation();

  const closeHandler = useCallback(() => {
    if (walletProvider.walletUnitAttestation.required) {
      return;
    }
    resetNavigationAction(rootNavigation, [
      { name: 'Dashboard', params: { screen: 'Wallet' } },
    ]);
  }, [rootNavigation, walletProvider.walletUnitAttestation.required]);

  const deleteWallet = useCallback(() => {
    rootNavigation.goBack();
    rootNavigation.navigate('Settings', { screen: 'DeleteWallet' });
  }, [rootNavigation]);

  const updateRegistration = useCallback(() => {
    rootNavigation.navigate('WalletUnitRegistration', { refresh: true });
  }, [rootNavigation]);

  const loaderLabel =
    state === LoaderViewState.Error
      ? translate('walletUnitRegistrationError.revoked')
      : translate('walletUnitRegistrationError.expired');

  const button: ButtonProps =
    state === LoaderViewState.Error
      ? {
          onPress: !walletProvider.walletUnitAttestation.required
            ? closeHandler
            : deleteWallet,
          title: !walletProvider.walletUnitAttestation.required
            ? translate('common.close')
            : translate('common.deleteWallet'),
          type: ButtonType.Primary,
        }
      : {
          onPress: updateRegistration,
          title: translate('common.update'),
          type: ButtonType.Primary,
        };

  const secondaryButton: ButtonProps | undefined =
    state === LoaderViewState.Warning
      ? {
          onPress: !walletProvider.walletUnitAttestation.required
            ? closeHandler
            : deleteWallet,
          title: !walletProvider.walletUnitAttestation.required
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
      title={translate('common.walletRegistration')}
    />
  );
};

export default WalletUnitErrorScreen;
