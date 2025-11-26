import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    isNFCSupported: false,
    isRSESetup: false,
    walletProvider: {
      appVersion: {
        minimum: 'v1.50.0',
        minimumRecommended: 'v1.60.0',
        reject: ['v1.51.4', 'v1.51.3'],
        updateScreen: {
          link: 'https://procivis.ch',
        },
      },
      name: 'PROCIVIS_ONE',
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
