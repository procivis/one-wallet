import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    holderDidId: '',
  });

  expect(instance).toBeTruthy();
});
