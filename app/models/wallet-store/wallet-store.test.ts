import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    holderDidHwId: '',
    holderDidSwId: '',
  });

  expect(instance).toBeTruthy();
});
