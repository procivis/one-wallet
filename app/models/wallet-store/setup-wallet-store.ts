/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { onSnapshot } from 'mobx-state-tree';

import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import { WalletStore, WalletStoreModel } from './wallet-store';

const WALLET_STATE_STORAGE_KEY = 'wallet';

export async function setupWalletStore(env: Environment) {
  let walletStore: WalletStore;
  const defaultData = {
    holderDidHwId: '',
    holderDidRseId: '',
    holderDidSwId: '',
  };

  try {
    const data = {
      ...defaultData,
      ...(await storage.load(WALLET_STATE_STORAGE_KEY)),
    };
    walletStore = WalletStoreModel.create(data, env);
  } catch (_e) {
    walletStore = WalletStoreModel.create(defaultData, env);
  }

  onSnapshot(walletStore, (snapshot) => {
    storage.save(WALLET_STATE_STORAGE_KEY, snapshot);
  });

  return walletStore;
}
