import { useAppColorScheme } from '@procivis/one-react-native-components';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export const Group: FunctionComponent<PropsWithChildren<any>> = ({
  children,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.group}>
      <View
        style={[styles.separator, { backgroundColor: colorScheme.grayDark }]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginTop: 16,
  },
  separator: {
    height: 1,
    marginBottom: 16,
    marginHorizontal: 4,
    opacity: 0.5,
  },
});
