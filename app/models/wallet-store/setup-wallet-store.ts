import { onSnapshot, SnapshotOut } from 'mobx-state-tree';
import NfcManager from 'react-native-nfc-manager';

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
  const isNFCSupported = await NfcManager.isSupported();

  const defaultData: NewStore = {
    holderAttestationKeyId: '',
    holderHwIdentifierId: '',
    holderRseIdentifierId: '',
    holderSwIdentifierId: '',
    isNFCSupported,
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
          holderAttestationKeyId: defaultData?.holderAttestationKeyId,
          holderHwIdentifierId:
            stored.holderDidHwId || defaultData.holderHwIdentifierId,
          holderRseIdentifierId:
            stored.holderDidRseId || defaultData.holderRseIdentifierId,
          holderSwIdentifierId:
            stored.holderDidSwId || defaultData.holderSwIdentifierId,
          isNFCSupported,
        };
      } else {
        data = {
          ...defaultData,
          ...stored,
          isNFCSupported,
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
