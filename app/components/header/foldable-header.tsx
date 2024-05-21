import {
  BlurView,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AnimatedSearchBarProps,
  SearchBarWithButton,
} from './animated-search-bar';

export type FoldableHeaderProps = {
  header: ReactElement;
  scrollOffset: Animated.Value;
  searchBar?: Omit<AnimatedSearchBarProps, 'collapsed'>;
};
export const FoldableSearchHeader: FunctionComponent<FoldableHeaderProps> = ({
  scrollOffset,
  searchBar,
  header,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();
  const [collapsed, setCollapsed] = useState(header ? false : true);
  const [headerHeight, setHeaderHeight] = useState();

  useEffect(() => {
    const id = scrollOffset.addListener(({ value }) => {
      if (!headerHeight) {
        return;
      }

      if (value > headerHeight) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    });
    return () => {
      scrollOffset.removeListener(id);
    };
  }, [scrollOffset, searchBar, headerHeight]);

  const scrollHeaderAnimatedStyle = headerHeight && {
    transform: [
      {
        translateY: scrollOffset.interpolate({
          extrapolate: 'clamp',
          inputRange: [0, headerHeight],
          outputRange: [0, -headerHeight],
        }),
      },
    ],
  };

  const fadeHeaderOutAnimatedStyle = headerHeight && {
    opacity: scrollOffset.interpolate({
      extrapolate: 'clamp',
      inputRange: [0, headerHeight / 2],
      outputRange: [1, 0],
    }),
  };

  const onHeaderLayout = useCallback(
    (event) => {
      setHeaderHeight(event.nativeEvent.layout.height);
    },
    [setHeaderHeight],
  );

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          paddingTop: safeAreaInsets.top,
        },
        scrollHeaderAnimatedStyle,
      ]}
    >
      <BlurView
        blurStyle={'header'}
        color={colorScheme.background}
        style={StyleSheet.absoluteFill}
      />
      <View>
        {header && (
          <Animated.View
            onLayout={onHeaderLayout}
            style={fadeHeaderOutAnimatedStyle}
          >
            {header}
          </Animated.View>
        )}
        {searchBar && (
          <SearchBarWithButton {...searchBar} collapsed={collapsed} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    width: '100%',
  },
});
