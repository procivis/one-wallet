import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import StatusCheckResultScreen from '../../screens/credential/status-check-result-screen';
import InvitationNavigator from '../invitation/invitation-navigator';
import IssueCredentialNavigator from '../issue-credential/issue-credential-navigator';
import ShareCredentialNavigator from '../share-credential/share-credential-navigator';
import { CredentialManagementNavigatorParamList } from './credential-management-routes';

const Stack =
  createNativeStackNavigator<CredentialManagementNavigatorParamList>();

const CredentialManagementNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={InvitationNavigator} name="Invitation" />
      <Stack.Screen
        component={IssueCredentialNavigator}
        name="IssueCredential"
      />
      <Stack.Screen
        component={ShareCredentialNavigator}
        name="ShareCredential"
      />
      <Stack.Screen
        component={StatusCheckResultScreen}
        name="StatusCheckResult"
      />
    </Stack.Navigator>
  );
};

export default CredentialManagementNavigator;
