import {
  AccessibilityLanguageProvider,
  ONECoreContextProvider,
} from '@procivis/one-react-native-components';
import { createStaticNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render } from '@testing-library/react-native';
import React, { FC, PropsWithChildren, useMemo } from 'react';
import { Text, View } from 'react-native';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';

import { RootStore, RootStoreModel, RootStoreProvider } from '../../app/models';
import { LocaleStoreModel } from '../../app/models/locale-store/locale-store';
import { UserSettingsStoreModel } from '../../app/models/user-settings-store/user-settings-store';
import {
  WalletProviderModel,
  WalletStoreModel,
} from '../../app/models/wallet-store/wallet-store';

export const defaultMockStore = (): RootStore => {
  return RootStoreModel.create({
    locale: LocaleStoreModel.create({
      locale: 'en',
    }),
    userSettings: UserSettingsStoreModel.create({
      biometrics: false,
      pinCodeSecurity: {
        failedAttempts: 0,
      },
      screenCaptureProtection: false,
    }),
    walletStore: WalletStoreModel.create({
      isNFCSupported: false,
      isRSESetup: false,
      walletProvider: WalletProviderModel.create({
        documentSigners: [],
        name: 'PROCIVIS_ONE',
        trustCollections: [],
        walletUnitAttestation: {
          appIntegrityCheckRequired: false,
          enabled: false,
          required: false,
        },
      }),
      walletUnitId: '',
    }),
  });
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});
// Suppress error prints
setLogger({
  error: () => {},
  log: console.log,
  warn: () => {},
});

export const getScreenWrapper = (store: RootStore) => {
  const Wrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
      <RootStoreProvider value={store}>
        <QueryClientProvider client={queryClient}>
          <AccessibilityLanguageProvider language="en">
            <ONECoreContextProvider>{children}</ONECoreContextProvider>
          </AccessibilityLanguageProvider>
        </QueryClientProvider>
      </RootStoreProvider>
    );
  };

  return Wrapper;
};

const otherScreen = (screenName: string) => {
  const OtherScreen: FC = () => {
    const route = useRoute();
    const params = useMemo(() => {
      const params = (route.params ?? {}) as Record<string, unknown>;
      return Object.keys(params).reduce<Record<string, string>>((aggr, key) => {
        const value = params[key];
        return {
          ...aggr,
          [key]: typeof value === 'string' ? value : JSON.stringify(value),
        };
      }, {});
    }, [route]);

    return (
      <View testID={`Screen-${screenName}`}>
        {Object.keys(params).map((key) => (
          <View key={key} testID={`Param-${key}`}>
            <Text>{params[key]}</Text>
          </View>
        ))}
      </View>
    );
  };
  return OtherScreen;
};

export interface ScreenRenderParams<Params extends object | undefined> {
  otherScreens?: string[];
  params: Params;
  screenName?: string;
  store?: RootStore;
}

export async function renderTestScreen<
  Params extends object | undefined = never,
>(screen: React.FunctionComponent<{}>, options?: ScreenRenderParams<Params>) {
  const screenName = options?.screenName || 'Screen';
  const otherScreens = (options?.otherScreens ?? []).reduce(
    (aggr, screen) => ({
      ...aggr,
      [screen]: otherScreen(screen),
    }),
    {},
  );
  const store = options?.store ?? defaultMockStore();

  const Stack = createNativeStackNavigator({
    screens: {
      [screenName]: screen,
      ...otherScreens,
    },
  });
  const Navigation = createStaticNavigation(Stack);

  return await render(
    <Navigation
      initialState={{
        routes: [
          {
            name: screenName,
            params: options?.params,
          },
        ],
      }}
    />,
    { wrapper: getScreenWrapper(store) },
  );
}
