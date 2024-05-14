import {
  BackButton,
  BackButtonIcon,
  GhostButton,
  InfoIcon,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

export type HeaderButtonProps = {
  onPress?: () => void;
};

export const HeaderBackButton: FC<HeaderButtonProps> = ({ onPress }) => {
  const navigation = useNavigation();
  const handleBackButtonPress = useCallback(() => {
    if (onPress) {
      return onPress();
    }
    navigation.goBack();
  }, [onPress, navigation]);
  if (!navigation.canGoBack) {
    return null;
  }
  return <BackButton onPress={handleBackButtonPress} testID="Screen.back" />;
};

export const HeaderCloseModalButton: FC<HeaderButtonProps> = ({ onPress }) => {
  const navigation = useNavigation<RootNavigationProp>();
  const handleCloseButtonPress = useCallback(() => {
    if (onPress) {
      return onPress();
    }
    navigation.navigate('Dashboard', {
      screen: 'Wallet',
    });
  }, [onPress, navigation]);
  return (
    <BackButton
      icon={BackButtonIcon.Close}
      onPress={handleCloseButtonPress}
      testID="Screen.closeButton"
    />
  );
};

export const HeaderModalBackButton: FC<HeaderButtonProps> = ({ onPress }) => {
  const navigation = useNavigation<RootNavigationProp>();
  const handleCloseButtonPress = useCallback(() => {
    if (onPress) {
      return onPress();
    }
    navigation.goBack();
  }, [onPress, navigation]);
  return (
    <BackButton
      icon={BackButtonIcon.Close}
      onPress={handleCloseButtonPress}
      testID="Screen.closeButton"
    />
  );
};

export type HeaderInfoButtonProps = {
  onPress: () => void;
};

export const HeaderInfoButton: FC<HeaderInfoButtonProps> = ({ onPress }) => {
  return (
    <GhostButton
      accessibilityLabel={translate('accessibility.nav.info')}
      icon={InfoIcon}
      onPress={onPress}
      testID="Screen.infoButton"
    />
  );
};
