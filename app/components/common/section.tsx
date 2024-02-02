import {
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { FC, PropsWithChildren } from 'react';
import React, { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export const Section: FC<
  PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    title: string;
    titleStyle?: StyleProp<ViewStyle>;
  }>
> = ({ children, style, title, titleStyle }) => {
  const colorScheme = useAppColorScheme();

  return (
    <View
      style={[styles.section, { backgroundColor: colorScheme.white }, style]}
    >
      <Typography
        accessibilityRole="header"
        bold={true}
        caps={true}
        color={colorScheme.text}
        size="sml"
        style={[styles.title, titleStyle]}
      >
        {title}
      </Typography>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    marginBottom: 12,
    padding: 24,
    paddingTop: 12,
  },
  title: {
    marginBottom: 12,
  },
});
