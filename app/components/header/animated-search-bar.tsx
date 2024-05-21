import {
  SearchBar,
  SearchBarProps,
} from '@procivis/one-react-native-components';
import React, { ReactNode, useEffect, useState } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

export type AnimatedSearchBarProps = {
  collapsed: boolean;
  rightButton?: ReactNode;
  rightButtonAlwaysVisible?: boolean;
  searchBarProps: SearchBarProps;
};

// Animated search bar, according to
// https://www.figma.com/design/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?node-id=1143-40433&m=dev

export const SearchBarWithButton = ({
  collapsed,
  rightButtonAlwaysVisible = false,
  searchBarProps,
  rightButton,
}: AnimatedSearchBarProps) => {
  const [rightIconFadeAnimation] = useState(
    () => new Animated.Value(rightButton && rightButtonAlwaysVisible ? 1.5 : 0),
  );
  const [searchPaddingAnimation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(searchPaddingAnimation, {
      duration: 250,
      toValue: collapsed ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [collapsed, searchPaddingAnimation]);

  useEffect(() => {
    if (rightButtonAlwaysVisible) {
      return;
    }

    Animated.timing(rightIconFadeAnimation, {
      duration: 250,
      toValue: collapsed && rightButton ? 1 : 0,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(rightIconFadeAnimation, {
        duration: 200,
        toValue: collapsed && rightButton ? 1.5 : 0,
        useNativeDriver: false,
      }).start();
    });
  }, [
    rightButtonAlwaysVisible,
    rightIconFadeAnimation,
    rightButton,
    collapsed,
  ]);

  const searchBarContainerAnimatedStyle = {
    paddingHorizontal: searchPaddingAnimation.interpolate({
      extrapolate: 'clamp',
      inputRange: [0, 1],
      outputRange: [16, 20],
    }),
  };

  const optionsIconAnimatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
    opacity: rightIconFadeAnimation.interpolate({
      extrapolate: 'clamp',
      inputRange: [1, 1.5],
      outputRange: [0, 1],
    }),
  };

  const searchBarAnimatedStyle = {
    width: rightIconFadeAnimation.interpolate({
      extrapolate: 'clamp',
      inputRange: [0, 1],
      outputRange: ['100%', '88%'],
    }),
  };

  const { style: searchBarStyle, ...searchProps } = searchBarProps;
  return (
    <Animated.View
      style={[
        styles.searchBarContainer,
        searchBarContainerAnimatedStyle,
        searchBarStyle,
      ]}
    >
      <Animated.View style={searchBarAnimatedStyle}>
        <SearchBar {...searchProps} />
      </Animated.View>
      {rightButton && (
        <Animated.View
          style={[styles.rightButtonWrapper, optionsIconAnimatedStyle]}
        >
          {rightButton}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rightButtonWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
});
