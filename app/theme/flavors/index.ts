import { ColorScheme } from '@procivis/one-react-native-components';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

const flavor: {
  colorScheme: ColorScheme;
  darkModeColorScheme?: ColorScheme;
} = require('./procivis');

const colorScheme: ColorScheme = flavor.colorScheme;
const darkModeColorScheme: ColorScheme | undefined = flavor.darkModeColorScheme;

export interface AppColorScheme extends ColorScheme {
  /** used for native OS picker component */
  nativePickerText: string;
}

export function useFlavorColorScheme(): AppColorScheme {
  const osDarkMode = useColorScheme() === 'dark';
  return useMemo(() => {
    const darkMode = Boolean(osDarkMode && darkModeColorScheme);
    const nativePickerText = osDarkMode ? '#ffffff' : '#000000';
    const scheme = darkMode ? darkModeColorScheme! : colorScheme;
    return { nativePickerText, ...scheme };
  }, [osDarkMode]);
}
