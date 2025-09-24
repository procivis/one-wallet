import {
  ButtonProps,
  ButtonType,
  LoaderViewState,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { WalletUnitStatusEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { useWalletUnitAttestation } from '../../hooks/wallet-unit';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const WalletUnitErrorScreen: FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
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
          onPress: deleteWallet,
          title: translate('common.deleteWallet'),
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
          onPress: deleteWallet,
          title: translate('common.deleteWallet'),
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
