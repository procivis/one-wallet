import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const tabBarHeight = 75;

const TabBarAwareContainer: FunctionComponent = ({ children }) => {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.contentContainer,
        {
          marginBottom: Math.max(safeAreaInsets.bottom, 20) + tabBarHeight,
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});

export default TabBarAwareContainer;
