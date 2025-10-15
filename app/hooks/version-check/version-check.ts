import { useNavigation } from '@react-navigation/native';
import { compare } from 'compare-versions';
import { useCallback, useMemo } from 'react';
import DeviceInfo from 'react-native-device-info';

import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';

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

  const checkAppVersion = useCallback(() => {
    const isWrongVersion =
      isBelowMinimumVersion || isBelowRecommendedVersion || isRejectedVersion;

    if (isWrongVersion) {
      navigation.navigate('VersionUpdate');
    }
  }, [
    isBelowMinimumVersion,
    isBelowRecommendedVersion,
    isRejectedVersion,
    navigation,
  ]);

  return {
    checkAppVersion,
    isBelowMinimumVersion,
    isBelowRecommendedVersion,
    isRejectedVersion,
  };
};

export default useVersionCheck;
