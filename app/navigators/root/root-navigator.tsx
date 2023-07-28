import { useAppColorScheme } from '@procivis/react-native-components';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { FunctionComponent } from 'react';
import { StatusBar } from 'react-native';

import { useAutomaticPinCodeCoverLogic } from '../../components/pin-code/pin-code-check';
import CredentialDetailScreen from '../../screens/credential/credential-detail-screen';
import PinCodeCheckScreen from '../../screens/onboarding/pin-code-check-screen';
import { AppColorScheme } from '../../theme';
import InvitationNavigator from '../invitation/invitation-navigator';
import IssueCredentialNavigator from '../issue-credential/issue-credential-navigator';
import OnboardingNavigator from '../onboarding/onboarding-navigator';
import SettingsNavigator from '../settings/settings-navigator';
import ShareCredentialNavigator from '../share-credential/share-credential-navigator';
import TabsNavigator from '../tabs/tabs-navigator';
import { hideSplashScreen, useInitialRoute } from './initialRoute';
import { RootNavigatorParamList } from './root-navigator-routes';

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigator: FunctionComponent = () => {
  const { darkMode } = useAppColorScheme<AppColorScheme>();
  const initialRouteName = useInitialRoute();
  useAutomaticPinCodeCoverLogic(initialRouteName === 'Tabs');

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
        <RootStack.Group screenOptions={{ gestureEnabled: false }}>
          <RootStack.Screen
            name="PinCodeCheck"
            component={PinCodeCheckScreen}
            options={{ animation: 'fade' }}
            listeners={{ transitionEnd: () => hideSplashScreen() }}
          />
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
          <RootStack.Screen name="Tabs" component={TabsNavigator} />
          <RootStack.Screen name="Invitation" component={InvitationNavigator} />
          <RootStack.Screen name="IssueCredential" component={IssueCredentialNavigator} />
          <RootStack.Screen name="ShareCredential" component={ShareCredentialNavigator} />
        </RootStack.Group>
        <RootStack.Screen name="Settings" component={SettingsNavigator} />
        <RootStack.Screen name="CredentialDetail" component={CredentialDetailScreen} />
      </RootStack.Navigator>
    </>
  ) : null;
};

export default RootNavigator;
