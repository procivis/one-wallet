import { Configuration } from '../../../models/config/config';
import { commonConfig } from '../common/config';

export const config: Omit<Configuration, 'walletProvider'> = {
  ...commonConfig,
  appName: 'Procivis One Wallet',
  appleStoreId: 'procivis-one-wallet/id6480111491',
  googleStoreId: 'ch.procivis.one.wallet.trial',
};
