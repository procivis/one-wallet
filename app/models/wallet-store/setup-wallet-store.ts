import { onSnapshot, SnapshotOut } from 'mobx-state-tree';

import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import { WalletStore, WalletStoreModel } from './wallet-store';

const WALLET_STATE_STORAGE_KEY = 'wallet';

type OldStore = {
  holderDidHwId?: string;
  holderDidRseId?: string;
  holderDidSwId?: string;
};
type NewStore = SnapshotOut<WalletStore>;
type PossibleStoredData = OldStore | NewStore;

export async function setupWalletStore(env: Environment) {
  let walletStore: WalletStore;
  const defaultData: NewStore = {
    holderHwIdentifierId: '',
    holderRseIdentifierId: '',
    holderSwIdentifierId: '',
  };

  try {
    const stored: PossibleStoredData | null = await storage.load(
      WALLET_STATE_STORAGE_KEY,
    );

    let data: NewStore = defaultData;
    if (stored) {
      // migrate from potential old did-ids
      if ('holderDidSwId' in stored) {
        data = {
          holderHwIdentifierId:
            stored.holderDidHwId || defaultData.holderHwIdentifierId,
          holderRseIdentifierId:
            stored.holderDidRseId || defaultData.holderRseIdentifierId,
          holderSwIdentifierId:
            stored.holderDidSwId || defaultData.holderSwIdentifierId,
        };
      } else {
        data = {
          ...defaultData,
          ...stored,
        };
      }
    }

    walletStore = WalletStoreModel.create(data, env);
  } catch (_e) {
    walletStore = WalletStoreModel.create(defaultData, env);
  }

  onSnapshot(walletStore, (snapshot) => {
    storage.save(WALLET_STATE_STORAGE_KEY, snapshot);
  });

  return walletStore;
}
