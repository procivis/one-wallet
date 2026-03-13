import { useNavigation } from '@react-navigation/native';
import { compare } from 'compare-versions';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { loadString, saveString, useLoadString } from '../../utils/storage';

const ignoredRecommendedVersionStorageKey = 'ignoredRecommendedVersion';
const ignoredRecommendedVersionNoticeStorageKey =
  'ignoredRecommendedVersionNotice';

const parseVersion = (version: string) => {
  const trimmedVersion = version.trim();
  return trimmedVersion.startsWith('v')
    ? trimmedVersion.slice(1)
    : trimmedVersion;
};

const useVersionCheck = () => {
  const {
    walletStore: { walletProvider },
  } = useStores();
  const appVersion = `${DeviceInfo.getVersion()}.${DeviceInfo.getBuildNumber()}`;
  const navigation = useNavigation<RootNavigationProp>();
  const {
    value: ignoredRecommendedVersion,
    isLoading: isIgnoredRecommendedVersionLoading,
  } = useLoadString(ignoredRecommendedVersionStorageKey);
  const [ignoredRecommendedVersionNotice, setIgnoredRecommendedVersionNotice] =
    useState<string>();

  useEffect(() => {
    loadString(ignoredRecommendedVersionNoticeStorageKey).then((v) =>
      setIgnoredRecommendedVersionNotice(v ?? undefined),
    );
  }, []);

  const ignoreRecommendedVersion = useCallback(() => {
    const recommendedVersion = walletProvider.appVersion?.minimumRecommended;
    if (!recommendedVersion) {
      return;
    }
    saveString(ignoredRecommendedVersionStorageKey, recommendedVersion);
  }, [walletProvider.appVersion?.minimumRecommended]);

  const ignoreRecommendedVersionNotice = useCallback(() => {
    const recommendedVersion = walletProvider.appVersion?.minimumRecommended;
    if (!recommendedVersion) {
      return;
    }
    saveString(ignoredRecommendedVersionNoticeStorageKey, recommendedVersion);
    setIgnoredRecommendedVersionNotice(recommendedVersion);
  }, [walletProvider.appVersion?.minimumRecommended]);

  const isBelowMinimumVersion = useMemo(() => {
    const minumumVersion = walletProvider.appVersion?.minimum;
    return Boolean(
      appVersion &&
        minumumVersion &&
        compare(appVersion, parseVersion(minumumVersion), '<'),
    );
  }, [appVersion, walletProvider.appVersion?.minimum]);

  const isBelowRecommendedVersion = useMemo(() => {
    const recommendedVersion = walletProvider.appVersion?.minimumRecommended;
    return Boolean(
      appVersion &&
        recommendedVersion &&
        compare(appVersion, parseVersion(recommendedVersion), '<'),
    );
  }, [appVersion, walletProvider.appVersion?.minimumRecommended]);

  const isRejectedVersion = useMemo(() => {
    const parsedRejectedVersions =
      walletProvider.appVersion?.reject.map(parseVersion);
    return appVersion && parsedRejectedVersions?.includes(appVersion);
  }, [appVersion, walletProvider.appVersion?.reject]);

  const isUpdateNotIgnored = useMemo(() => {
    if (isBelowMinimumVersion || isRejectedVersion) {
      return true;
    }
    const recommendedVersion = walletProvider.appVersion?.minimumRecommended;
    return (
      !isIgnoredRecommendedVersionLoading &&
      recommendedVersion !== ignoredRecommendedVersion
    );
  }, [
    isBelowMinimumVersion,
    isRejectedVersion,
    walletProvider.appVersion?.minimumRecommended,
    isIgnoredRecommendedVersionLoading,
    ignoredRecommendedVersion,
  ]);

  const checkAppVersion = useCallback(() => {
    const isWrongVersion =
      isBelowMinimumVersion || isBelowRecommendedVersion || isRejectedVersion;

    if (isWrongVersion && isUpdateNotIgnored) {
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('VersionUpdate');
      });
      return false;
    }
    return true;
  }, [
    isBelowMinimumVersion,
    isBelowRecommendedVersion,
    isRejectedVersion,
    isUpdateNotIgnored,
    navigation,
  ]);

  const showRecommendedUpdateNotice = useMemo(() => {
    const recommendedVersion = walletProvider.appVersion?.minimumRecommended;
    return (
      isBelowRecommendedVersion &&
      recommendedVersion !== ignoredRecommendedVersionNotice
    );
  }, [
    ignoredRecommendedVersionNotice,
    isBelowRecommendedVersion,
    walletProvider.appVersion?.minimumRecommended,
  ]);

  return {
    checkAppVersion,
    ignoreRecommendedVersion,
    ignoreRecommendedVersionNotice,
    isBelowMinimumVersion,
    isBelowRecommendedVersion,
    isRejectedVersion,
    showRecommendedUpdateNotice,
  };
};

export default useVersionCheck;
