import { WalletProviderTypeEnum } from '@procivis/react-native-one-core';

import { Configuration } from '../../../../models/config/config';
import { config as procivisConfig } from '../config';

export const config: Configuration = {
  ...procivisConfig,
  walletProvider: {
    type: WalletProviderTypeEnum.PROCIVIS_ONE,
    url: 'https://core.test.procivis-one.com',
  },
};
