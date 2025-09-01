import { WalletStoreModel } from './wallet-store';

test('can be created', () => {
  const instance = WalletStoreModel.create({
    holderAttestationKeyId: '',
    holderHwIdentifierId: '',
    holderRseIdentifierId: '',
    holderSwIdentifierId: '',
  });

  expect(instance).toBeTruthy();
});
