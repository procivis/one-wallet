import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    holderHwIdentifierId: '',
    holderRseIdentifierId: '',
    holderSwIdentifierId: '',
    isNFCSupported: false,
    walletProvider: {
      appVersion: {
        minimum: 'v1.50.0',
        minimumRecommended: 'v1.60.0',
        reject: ['v1.51.4', 'v1.51.3'],
        updateScreen: {
          link: 'https://apps.apple.com/us/app/procivis-one-wallet/id6480111491',
        },
      },
      name: 'PROCIVIS_ONE',
      walletLink: 'https://procivis.ch',
      walletUnitAttestation: {
        appIntegrityCheckRequired: true,
        enabled: true,
        required: false,
      },
    },
    walletUnitId: '',
  });

  expect(instance).toBeTruthy();
});
