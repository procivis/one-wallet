import { useAppColorScheme } from '@procivis/react-native-components';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export interface GradientBackgroundProps {
  colors?: string[];
}

export const GradientBackground: React.FunctionComponent<GradientBackgroundProps> = ({ colors }) => {
  const colorScheme = useAppColorScheme();
  return (
    <LinearGradient
      colors={colors ?? (colorScheme.lineargradient as [string, string])}
      start={[0.5, 0]}
      end={[0.5, 1]}
      style={[styles.background, { backgroundColor: colorScheme.background }]}
    />
  );
};
