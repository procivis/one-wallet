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

export const HeaderBackButton: FC = () => {
  const navigation = useNavigation();
  const handleBackButtonPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  if (!navigation.canGoBack) {
    return null;
  }
  return <BackButton onPress={handleBackButtonPress} />;
};

export type HeaderCloseModalButtonProps = {
  onPress?: () => void;
};

export const HeaderCloseModalButton: FC<HeaderCloseModalButtonProps> = ({
  onPress,
}) => {
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

export const HeaderModalBackButton: FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const handleCloseButtonPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
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
      // style={style}
      testID="Screen.infoButton"
    />
  );
};
