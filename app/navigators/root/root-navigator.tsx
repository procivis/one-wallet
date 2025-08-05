import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { FunctionComponent } from 'react';

import { useRuntimeDeepLinkHandling } from '../../hooks/navigation/deep-link';
import { useAutomaticPinCodeCoverLogic } from '../../hooks/pin-code/pin-code-check';
import CredentialUpdateProcessScreen from '../../screens/credential/credential-update-process-screen';
import ImagePreviewScreen from '../../screens/credential/image-preview-screen';
import StatusCheckResultScreen from '../../screens/credential/status-check-result-screen';
import PinCodeCheckScreen from '../../screens/onboarding/pin-code-check-screen';
import { RSESignScreen } from '../../screens/rse/rse-sign-screen';
import CredentialDetailNavigator from '../credential-detail/credential-detail-navigator';
import CredentialManagementNavigator from '../credential-management/credential-management-navigator';
import DashboardNavigator from '../dashboard/dashboard-navigator';
import {
  FORM_SHEET_OPTIONS,
  formSheetWrapper,
  FULL_SCREEN_MODAL_OPTIONS,
} from '../navigation-utilities';
import NerdModeNavigator from '../nerd-mode/nerd-mode-navigator';
import OnboardingNavigator from '../onboarding/onboarding-navigator';
import SettingsNavigator from '../settings/settings-navigator';
import { hideSplashScreen, useInitialRoute } from './initialRoute';
import { RootNavigatorParamList } from './root-routes';

const CredentialUpdateProcess = React.memo(
  formSheetWrapper(CredentialUpdateProcessScreen),
);
const StatusCheckResult = React.memo(formSheetWrapper(StatusCheckResultScreen));

const RootStack = createNativeStackNavigator<RootNavigatorParamList>();

const RootNavigator: FunctionComponent = () => {
  const initialRouteName = useInitialRoute();
  useAutomaticPinCodeCoverLogic(initialRouteName === 'Dashboard');
  useRuntimeDeepLinkHandling();

  return initialRouteName ? (
    <RootStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        animationTypeForReplace: 'push',
        headerShown: false,
      }}
    >
      <RootStack.Screen component={SettingsNavigator} name="Settings" />
      <RootStack.Screen
        component={CredentialDetailNavigator}
        name="CredentialDetail"
      />

      {/* screens with disabled OS navigation */}
      <RootStack.Group screenOptions={{ gestureEnabled: false }}>
        <RootStack.Screen
          component={PinCodeCheckScreen}
          listeners={{ transitionEnd: () => hideSplashScreen() }}
          name="PinCodeCheck"
          options={{
            animation: 'fade',
          }}
        />
        <RootStack.Screen component={OnboardingNavigator} name="Onboarding" />
        <RootStack.Screen component={DashboardNavigator} name="Dashboard" />
      </RootStack.Group>

      <RootStack.Group screenOptions={FORM_SHEET_OPTIONS}>
        <RootStack.Screen
          component={CredentialManagementNavigator}
          name="CredentialManagement"
          options={{ gestureEnabled: false }}
        />
        <RootStack.Screen
          component={CredentialUpdateProcess}
          name="CredentialUpdateProcess"
        />
        <RootStack.Screen
          component={StatusCheckResult}
          name="StatusCheckResult"
        />
      </RootStack.Group>

      <RootStack.Group screenOptions={FULL_SCREEN_MODAL_OPTIONS}>
        <RootStack.Screen component={NerdModeNavigator} name="NerdMode" />
        <RootStack.Screen component={ImagePreviewScreen} name="ImagePreview" />
        <RootStack.Screen component={RSESignScreen} name="RSESign" />
      </RootStack.Group>
    </RootStack.Navigator>
  ) : null;
};

export default RootNavigator;
