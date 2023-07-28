import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import InvitationProcessScreen from '../../screens/credential/invitation-process-screen';
import { InvitationNavigatorParamList } from './invitation-routes';

const Stack = createNativeStackNavigator<InvitationNavigatorParamList>();

const InvitationNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Processing" component={InvitationProcessScreen} />
    </Stack.Navigator>
  );
};

export default InvitationNavigator;
