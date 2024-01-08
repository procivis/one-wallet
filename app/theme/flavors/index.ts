import { ColorScheme } from '@procivis/react-native-components';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import config from 'react-native-ultimate-config';

let flavor: {
  colorScheme: ColorScheme;
  darkModeColorScheme?: ColorScheme;
};

switch (config.CONFIG_NAME) {
  case 'procivis':
    flavor = require('./procivis');
    break;
}

const colorScheme: ColorScheme = flavor.colorScheme;
const darkModeColorScheme: ColorScheme | undefined = flavor.darkModeColorScheme;

export interface AppColorScheme extends ColorScheme {
  /** is a dark mode scheme */
  darkMode: boolean;
  /** used for native OS picker component */
  nativePickerText: string;
}

export function useFlavorColorScheme(): AppColorScheme {
  const osDarkMode = useColorScheme() === 'dark';
  return useMemo(() => {
    const darkMode = Boolean(osDarkMode && darkModeColorScheme);
    const nativePickerText = osDarkMode ? '#FFFFFF' : '#000000';
    return Object.assign(
      { darkMode, nativePickerText },
      darkMode ? darkModeColorScheme : colorScheme,
    );
  }, [osDarkMode]);
}
