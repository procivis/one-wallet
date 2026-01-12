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
  if (!config.walletProvider) {
    // no provider specified, skip wallet-unit setup
    return undefined;
  }

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
      walletUnitAttestation: {
        appIntegrityCheckRequired: false,
        enabled: false,
        required: false,
      },
    },
  );

  const defaultData: NewStore = {
    isNFCSupported,
    isRSESetup: false,
    walletProvider,
    walletUnitId: '',
  };

  try {
    const stored: PossibleStoredData | null = await storage.load(
      WALLET_STATE_STORAGE_KEY,
    );

    let data: NewStore = defaultData;
    if (stored && 'holderDidRseId' in stored) {
      data.isRSESetup = true;
    } else if (stored && 'isRSESetup' in stored) {
      data = stored;
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
