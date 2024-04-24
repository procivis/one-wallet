import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import CredentialDeleteProcessScreen from '../../screens/credential/credential-delete-process-screen';
import CredentialDetailScreen from '../../screens/credential/credential-detail-screen';
import { CredentialHistoryScreen } from '../../screens/credential/credential-history-screen';
import CredentialDetailNerdScreen from '../../screens/credential/credential-nerd-screen';
import { CredentialDetailNavigatorParamList } from './credential-detail-routes';

const Stack = createNativeStackNavigator<CredentialDetailNavigatorParamList>();

const CredentialDetailNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CredentialDetailScreen} name="Detail" />
      <Stack.Screen
        component={CredentialDeleteProcessScreen}
        name="DeleteProcessing"
      />
      <Stack.Screen component={CredentialHistoryScreen} name="History" />
      <Stack.Screen
        component={CredentialDetailNerdScreen}
        name="CredentialNerdScreen"
        options={{
          animation:
            Platform.OS === 'android' ? 'slide_from_bottom' : undefined,
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
};

export default CredentialDetailNavigator;
