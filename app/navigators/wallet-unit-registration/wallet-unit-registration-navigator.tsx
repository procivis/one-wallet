import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useStores } from '../../models';
import WalletUnitInfoScreen from '../../screens/wallet-attestation/wallet-unit-info-screen';
import WalletUnitRegistrationScreen from '../../screens/wallet-attestation/wallet-unit-registration-screen';
import { RootRouteProp } from '../root/root-routes';
import { WalletUnitRegistrationNavigatorParamList } from './wallet-unit-registration-routes';

const Stack =
  createNativeStackNavigator<WalletUnitRegistrationNavigatorParamList>();

const WalletUnitRegistrationNavigator = () => {
  const route = useRoute<RootRouteProp<'WalletUnitRegistration'>>();
  const {
    walletStore: { walletProvider },
  } = useStores();

  return (
    <Stack.Navigator
      initialRouteName={
        walletProvider.userAuthentication &&
        route.params.operation !== 'refresh'
          ? 'Info'
          : 'Registration'
      }
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        component={WalletUnitInfoScreen}
        initialParams={route.params}
        name="Info"
      />
      <Stack.Screen
        component={WalletUnitRegistrationScreen}
        initialParams={route.params}
        name="Registration"
      />
    </Stack.Navigator>
  );
};

export default WalletUnitRegistrationNavigator;
