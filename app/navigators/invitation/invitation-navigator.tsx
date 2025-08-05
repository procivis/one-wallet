import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import InvitationProcessScreen from '../../screens/credential/invitation-process-screen';
import { formSheetWrapper } from '../navigation-utilities';
import { InvitationNavigatorParamList } from './invitation-routes';

const Processing = React.memo(formSheetWrapper(InvitationProcessScreen));

const Stack = createNativeStackNavigator<InvitationNavigatorParamList>();

const InvitationNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={Processing} name="Processing" />
    </Stack.Navigator>
  );
};

export default InvitationNavigator;
