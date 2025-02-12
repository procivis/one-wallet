import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    holderDidHwId: '',
    holderDidRseId: '',
    holderDidSwId: '',
  });

  expect(instance).toBeTruthy();
});
