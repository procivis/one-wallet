import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DashboardScreen from '../../screens/history/dashboard-screen';
import DetailScreen from '../../screens/history/detail-screen';
import { HistoryNavigatorParamList } from './history-routes';

const Stack = createNativeStackNavigator<HistoryNavigatorParamList>();

const HistoryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={DashboardScreen} name="Dashboard" />
      <Stack.Screen component={DetailScreen} name="Detail" />
    </Stack.Navigator>
  );
};

export default HistoryNavigator;
