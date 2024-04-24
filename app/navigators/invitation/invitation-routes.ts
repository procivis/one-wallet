import { OneError } from '@procivis/react-native-one-core';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type InvitationNavigatorParamList = {
  Error: {
    error: OneError;
  };
  Processing: { invitationUrl: string };
};

export type InvitationRouteProp<
  RouteName extends keyof InvitationNavigatorParamList,
> = RouteProp<InvitationNavigatorParamList, RouteName>;
export type InvitationNavigationProp<
  RouteName extends keyof InvitationNavigatorParamList,
> = NativeStackNavigationProp<InvitationNavigatorParamList, RouteName>;
