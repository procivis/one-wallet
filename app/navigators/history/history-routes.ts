import { HistoryListItem } from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type HistoryNavigatorParamList = {
  Dashboard: undefined;
  Detail: {
    entry: HistoryListItem;
  };
};

export type HistoryRouteProp<
  RouteName extends keyof HistoryNavigatorParamList,
> = RouteProp<HistoryNavigatorParamList, RouteName>;
export type HistoryNavigationProp<
  RouteName extends keyof HistoryNavigatorParamList,
> = NativeStackNavigationProp<HistoryNavigatorParamList, RouteName>;
