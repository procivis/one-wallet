import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import InvitationErrorDetailsScreen from '../../screens/credential/invitation-error-details-screen';
import InvitationProcessScreen from '../../screens/credential/invitation-process-screen';
import { InvitationNavigatorParamList } from './invitation-routes';

const Stack = createNativeStackNavigator<InvitationNavigatorParamList>();

const InvitationNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={InvitationProcessScreen} name="Processing" />
      <Stack.Screen
        component={InvitationErrorDetailsScreen}
        name="Error"
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

export default InvitationNavigator;
