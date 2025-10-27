import { WalletProviderTypeEnum } from '@procivis/react-native-one-core';
import { Platform } from 'react-native';

import { Configuration } from '../../../../models/config/config';
import { config as procivisConfig } from '../config';

export const config: Configuration = {
  ...procivisConfig,
  featureFlags: {
    ...procivisConfig.featureFlags,
    nfcEnabled: Platform.OS === 'android',
  },
  walletProvider: {
    type: WalletProviderTypeEnum.PROCIVIS_ONE,
    url: 'https://core.trial.procivis-one.com',
  },
};
