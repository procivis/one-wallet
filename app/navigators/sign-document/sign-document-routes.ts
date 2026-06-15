import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type SignDocumentNavigatorParamList = {
  WalletCentricProcessScreen: {
    code: string;
    codeVerifier: string | undefined;
    document: string | undefined;
    documentName: string | undefined;
    provider: string;
  };
  WalletCentricSavedScreen: undefined;
};

export type SignDocumentRouteProp<
  RouteName extends keyof SignDocumentNavigatorParamList,
> = RouteProp<SignDocumentNavigatorParamList, RouteName>;
export type SignDocumentNavigationProp<
  RouteName extends keyof SignDocumentNavigatorParamList,
> = NativeStackNavigationProp<SignDocumentNavigatorParamList, RouteName>;
