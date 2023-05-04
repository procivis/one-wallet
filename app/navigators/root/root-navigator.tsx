import { useAppColorScheme } from '@procivis/react-native-components';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar } from 'react-native';

import { usePinCodeCheckLogic } from '../../components/pin-code/pin-code-cover';
import PinCodeCheckScreen from '../../screens/onboarding/pin-code-check-screen';
import AppInformationScreen from '../../screens/settings/app-information-screen';
import DeleteWalletScreen from '../../screens/settings/delete-wallet-screen';
import PinCodeChangeScreen from '../../screens/settings/pin-code-change-screen';
import SettingsScreen from '../../screens/settings/settings-screen';
import { AppColorScheme } from '../../theme';
import { hideSplashScreen, useInitialRoute } from './initialRoute';
import OnboardingNavigator from './onboarding/onboarding-navigator';
import { RootNavigatorParamList } from './root-navigator-routes';
import TabsNavigator from './tabs/tabs-navigator';

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigator = () => {
  const { darkMode } = useAppColorScheme<AppColorScheme>();
  const initialRouteName = useInitialRoute();
  usePinCodeCheckLogic(initialRouteName === 'Tabs');
  return initialRouteName ? (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        animated={true}
      />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animationTypeForReplace: 'push',
        }}
        initialRouteName={initialRouteName}>
        <RootStack.Screen
          name="PinCodeCheck"
          component={PinCodeCheckScreen}
          options={{ animation: 'fade' }}
          listeners={{ transitionEnd: () => hideSplashScreen() }}
        />
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="Tabs" component={TabsNavigator} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
        <RootStack.Screen name="AppInformation" component={AppInformationScreen} />
        <RootStack.Screen name="DeleteWallet" component={DeleteWalletScreen} />
        <RootStack.Screen name="PinCodeChange" component={PinCodeChangeScreen} />
      </RootStack.Navigator>
    </>
  ) : null;
};

export default RootNavigator;
