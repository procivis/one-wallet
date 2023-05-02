import { setupBackendConfigStore } from '../backend-config-store/setup-backend-config-store';
import { Environment } from '../environment';
import { setupLocaleStore } from '../locale-store/setup-locale-store';
import { setupUserSettingsStore } from '../user-settings-store/setup-user-settings-store';
import { setupWalletStore } from '../wallet-store/setup-wallet-store';
import { RootStoreModel } from './root-store';

/**
 * Setup the environment that all the models will be sharing.
 *
 * The environment includes other functions that will be picked from some
 * of the models that get created later. This is how we loosly couple things
 * like events between models.
 */
export async function createEnvironment() {
  const env = new Environment();
  await env.setup();
  return env;
}

/**
 * Setup the root state.
 */
export async function setupRootStore() {
  // prepare the environment that will be associated with the RootStore.
  const env = await createEnvironment();

  const rootStoreData = {
    walletStore: await setupWalletStore(env),
    backendConfigStore: await setupBackendConfigStore(env),
    locale: await setupLocaleStore(env),
    userSettings: await setupUserSettingsStore(env),
  };
  const rootStore = RootStoreModel.create(rootStoreData, env);
  return rootStore;
}
