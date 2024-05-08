import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import CredentialDetailScreen from '../../screens/credential/credential-detail-screen';
import { CredentialHistoryScreen } from '../../screens/credential/credential-history-screen';
import DeleteCredentialNavigator from '../delete-credential/delete-credential-navigator';
import { CredentialDetailNavigatorParamList } from './credential-detail-routes';

const Stack = createNativeStackNavigator<CredentialDetailNavigatorParamList>();

const CredentialDetailNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CredentialDetailScreen} name="Detail" />
      <Stack.Screen component={CredentialHistoryScreen} name="History" />
      <Stack.Screen
        component={DeleteCredentialNavigator}
        name="Delete"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          headerShown: false,
          presentation: 'formSheet',
        }}
      />
    </Stack.Navigator>
  );
};

export default CredentialDetailNavigator;
