import { reportException } from '@procivis/one-react-native-components';
import { isNfcHceSupported } from '@procivis/react-native-one-core';
import { onSnapshot, SnapshotOut } from 'mobx-state-tree';

import { config } from '../../config';
import * as storage from '../../utils/storage';
import { Environment } from '../environment';
import {
  WalletProviderData,
  WalletProviderModel,
  WalletStore,
  WalletStoreModel,
} from './wallet-store';

const WALLET_STATE_STORAGE_KEY = 'wallet';

type OldStore = {
  holderDidHwId?: string;
  holderDidRseId?: string;
  holderDidSwId?: string;
};
type NewStore = SnapshotOut<WalletStore>;
type PossibleStoredData = OldStore | NewStore;

const fetchWalletProviderConfig = async () => {
  try {
    const response = await fetch(
      `${config.walletProvider.url}/ssi/wallet-provider/v1/${config.walletProvider.type}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!response.ok) {
      throw new Error(`Error status: ${response.status}`);
    }
    return (await response.json()) as WalletProviderData;
  } catch (e) {
    reportException(e, 'Fetching wallet provider config failed!');
  }
};

export async function setupWalletStore(env: Environment) {
  let walletStore: WalletStore;
  const isNFCSupported = config.featureFlags.nfcEnabled
    ? await isNfcHceSupported()
    : false;
  const walletProviderData = await fetchWalletProviderConfig();

  const walletProvider = WalletProviderModel.create(
    walletProviderData ?? {
      name: '',
      walletLink: '',
      walletUnitAttestation: {
        appIntegrityCheckRequired: false,
        enabled: false,
        required: false,
      },
    },
  );

  const defaultData: NewStore = {
    holderHwIdentifierId: '',
    holderRseIdentifierId: '',
    holderSwIdentifierId: '',
    isNFCSupported,
    walletProvider,
    walletUnitId: '',
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
          isNFCSupported,
          walletProvider,
          walletUnitId: defaultData.walletUnitId,
        };
      } else {
        data = {
          ...defaultData,
          ...stored,
          isNFCSupported,
          walletProvider,
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
