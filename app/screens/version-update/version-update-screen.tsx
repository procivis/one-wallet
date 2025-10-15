import {
  ButtonType,
  concatTestID,
  LoaderViewState,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useMemo } from 'react';
import { Linking } from 'react-native';

import { ProcessingView } from '../../components/common/processing-view';
import useVersionCheck from '../../hooks/version-check/version-check';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const testID = 'VersionUpdateScreen';

const VersionUpdateScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const {
    walletStore: { walletProvider },
  } = useStores();
  const { isBelowMinimumVersion, isRejectedVersion } = useVersionCheck();
  const state =
    isBelowMinimumVersion || isRejectedVersion
      ? LoaderViewState.Error
      : LoaderViewState.Warning;

  const loaderLabel = useMemo(() => {
    switch (state) {
      case LoaderViewState.Error:
        return translate('info.versionUpdateScreen.error');
      case LoaderViewState.Warning:
        return translate('info.versionUpdateScreen.warning');
      default:
        return '';
    }
  }, [state]);

  const updateWalletLink = useMemo(
    () => walletProvider.appVersion?.updateScreen?.link,
    [walletProvider.appVersion?.updateScreen?.link],
  );

  const learnMoreLink = useMemo(
    () => walletProvider.walletLink,
    [walletProvider.walletLink],
  );

  const handleUpdate = useCallback(() => {
    if (updateWalletLink) {
      Linking.openURL(updateWalletLink);
    }
  }, [updateWalletLink]);

  const handleLearnMore = useCallback(() => {
    if (learnMoreLink) {
      Linking.openURL(learnMoreLink);
    }
  }, [learnMoreLink]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ProcessingView
      button={
        updateWalletLink
          ? {
              onPress: handleUpdate,
              testID: concatTestID(testID, 'handleUpdate'),
              title: translate('common.update'),
              type: ButtonType.Primary,
            }
          : undefined
      }
      loaderLabel={loaderLabel}
      onClose={state === LoaderViewState.Warning ? handleClose : undefined}
      secondaryButton={
        learnMoreLink
          ? {
              onPress: handleLearnMore,
              testID: concatTestID(testID, 'handleLearnMore'),
              title: translate('common.learnMore'),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      state={state}
      testID={concatTestID(testID)}
      title={translate('common.updateAvailable')}
    />
  );
};

export default memo(VersionUpdateScreen);
