import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    credentials: [],
    holderDidId: '',
  });

  expect(instance).toBeTruthy();
});
