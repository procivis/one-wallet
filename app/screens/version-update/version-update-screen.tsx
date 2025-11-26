import {
  ButtonType,
  concatTestID,
  LoaderViewState,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useMemo } from 'react';
import { Linking, Platform } from 'react-native';

import { ProcessingView } from '../../components/common/processing-view';
import { config } from '../../config';
import useVersionCheck, {
  ignoredUpdateVersionStorageKey,
} from '../../hooks/version-check/version-check';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { saveString } from '../../utils/storage';

const testID = 'VersionUpdateScreen';

const VersionUpdateScreen = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const {
    walletStore: { walletProvider },
  } = useStores();
  const { isBelowMinimumVersion, isRejectedVersion, appVersion } =
    useVersionCheck();
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

  const updateWalletLink = useMemo(() => {
    if (Platform.OS === 'ios') {
      return `https://apps.apple.com/app/${config.appleStoreId}`;
    }
    if (Platform.OS === 'android') {
      return `https://play.google.com/store/apps/details?id=${config.googleStoreId}`;
    }
  }, []);

  const learnMoreLink = useMemo(
    () => walletProvider.appVersion?.updateScreen?.link,
    [walletProvider.appVersion?.updateScreen?.link],
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
    saveString(ignoredUpdateVersionStorageKey, appVersion);
    navigation.goBack();
  }, [appVersion, navigation]);

  return (
    <ProcessingView
      button={{
        onPress: handleUpdate,
        testID: concatTestID(testID, 'handleUpdate'),
        title: translate('common.update'),
        type: ButtonType.Primary,
      }}
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
