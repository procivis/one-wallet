import { AssetsConfiguration } from '../../../models/config/assets';
import { Configuration } from '../../../models/config/config';
import { commonConfig } from '../common/config';

export const assets: AssetsConfiguration = {};

export const config: Configuration = {
  ...commonConfig,
  appName: 'Procivis One Wallet',
  appleStoreId: 'procivis-one-wallet/id6480111491',
  featureFlags: { ...commonConfig.featureFlags, ubiquRse: false },
  googleStoreId: 'ch.procivis.one.wallet.trial',
};
