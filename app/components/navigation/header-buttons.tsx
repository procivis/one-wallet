import {
  BackButton,
  BackButtonIcon,
  GhostButton,
  InfoIcon,
  OptionsIcon,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { translate, TxKeyPath } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';

export type HeaderButtonProps = {
  onPress?: () => void;
  testID: string;
};

export const HeaderBackButton: FC<HeaderButtonProps> = ({
  onPress,
  testID,
}) => {
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
  return <BackButton onPress={handleBackButtonPress} testID={testID} />;
};

export const HeaderCloseModalButton: FC<HeaderButtonProps> = ({
  onPress,
  testID,
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
      testID={testID}
    />
  );
};

export type HeaderInfoButtonProps = {
  onPress: () => void;
  testID: string;
};

export const HeaderInfoButton: FC<HeaderInfoButtonProps> = ({
  onPress,
  testID,
}) => {
  return (
    <GhostButton
      accessibilityLabel={translate('common.info')}
      icon={InfoIcon}
      onPress={onPress}
      testID={testID}
    />
  );
};

export type HeaderOptionsButtonProps = {
  accessibilityLabel: TxKeyPath;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID: string;
};

export const HeaderOptionsButton: FC<HeaderOptionsButtonProps> = ({
  onPress,
  testID,
  style,
  accessibilityLabel,
}) => {
  return (
    <GhostButton
      accessibilityLabel={translate(accessibilityLabel)}
      icon={OptionsIcon}
      onPress={onPress}
      style={style}
      testID={testID}
    />
  );
};
