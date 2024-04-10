import {
  BackButton,
  BackButtonIcon,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';

import { RootNavigationProp } from '../../navigators/root/root-routes';

export const HeaderBackButton = () => {
  const navigation = useNavigation();
  const handleBackButtonPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  if (!navigation.canGoBack) {
    return null;
  }
  return <BackButton onPress={handleBackButtonPress} />;
};

export const HeaderCloseModalButton = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const handleCloseButtonPress = useCallback(() => {
    navigation.navigate('Dashboard', {
      screen: 'Wallet',
    });
  }, [navigation]);
  return (
    <BackButton
      icon={BackButtonIcon.Close}
      onPress={handleCloseButtonPress}
      testID="Screen.closeButton"
    />
  );
};
