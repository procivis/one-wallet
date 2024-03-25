import { useAppColorScheme } from '@procivis/one-react-native-components';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { FunctionComponent } from 'react';
import { StatusBar } from 'react-native';

import { useAutomaticPinCodeCoverLogic } from '../../components/pin-code/pin-code-check';
import ImagePreviewScreen from '../../screens/credential/image-preview-screen';
import PinCodeCheckScreen from '../../screens/onboarding/pin-code-check-screen';
import { AppColorScheme } from '../../theme';
import CredentialDetailNavigator from '../credential-detail/credential-detail-navigator';
import DashboardNavigator from '../dashboard/dashboard-navigator';
import InvitationNavigator from '../invitation/invitation-navigator';
import IssueCredentialNavigator from '../issue-credential/issue-credential-navigator';
import OnboardingNavigator from '../onboarding/onboarding-navigator';
import SettingsNavigator from '../settings/settings-navigator';
import ShareCredentialNavigator from '../share-credential/share-credential-navigator';
import { hideSplashScreen, useInitialRoute } from './initialRoute';
import { RootNavigatorParamList } from './root-routes';

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigator: FunctionComponent = () => {
  const { darkMode } = useAppColorScheme<AppColorScheme>();
  const initialRouteName = useInitialRoute();
  useAutomaticPinCodeCoverLogic(initialRouteName === 'Dashboard');

  return initialRouteName ? (
    <>
      <StatusBar
        animated={true}
        backgroundColor="transparent"
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        translucent={true}
      />
      <RootStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          animationTypeForReplace: 'push',
          headerShown: false,
        }}
      >
        <RootStack.Group screenOptions={{ gestureEnabled: false }}>
          <RootStack.Screen
            component={PinCodeCheckScreen}
            listeners={{ transitionEnd: () => hideSplashScreen() }}
            name="PinCodeCheck"
            options={{ animation: 'fade' }}
          />
          <RootStack.Screen component={OnboardingNavigator} name="Onboarding" />
          <RootStack.Screen component={DashboardNavigator} name="Dashboard" />
          <RootStack.Screen component={InvitationNavigator} name="Invitation" />
          <RootStack.Screen
            component={IssueCredentialNavigator}
            name="IssueCredential"
          />
          <RootStack.Screen
            component={ShareCredentialNavigator}
            name="ShareCredential"
          />
        </RootStack.Group>
        <RootStack.Screen component={SettingsNavigator} name="Settings" />
        <RootStack.Screen
          component={CredentialDetailNavigator}
          name="CredentialDetail"
        />
        <RootStack.Screen component={ImagePreviewScreen} name="ImagePreview" />
      </RootStack.Navigator>
    </>
  ) : null;
};

export default RootNavigator;
