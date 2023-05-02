import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    exists: false,
  });

  expect(instance).toBeTruthy();
});
