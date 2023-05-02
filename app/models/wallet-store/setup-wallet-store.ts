import { onSnapshot } from 'mobx-state-tree';

import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import { WalletStore, WalletStoreModel } from './wallet-store';

const WALLET_STATE_STORAGE_KEY = 'wallet';

export async function setupWalletStore(env: Environment) {
  let walletStore: WalletStore;
  const defaultData = {
    exists: false,
  };

  try {
    const data = { ...defaultData, ...(await storage.load(WALLET_STATE_STORAGE_KEY)) };
    walletStore = WalletStoreModel.create(data, env);
  } catch (e) {
    walletStore = WalletStoreModel.create(defaultData, env);
  }

  onSnapshot(walletStore, (snapshot) => {
    storage.save(WALLET_STATE_STORAGE_KEY, snapshot);
  });

  return walletStore;
}
