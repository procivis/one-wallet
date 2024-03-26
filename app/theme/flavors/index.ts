import { ColorScheme } from '@procivis/one-react-native-components';
import { ColorScheme as ColorScheme__OLD } from '@procivis/react-native-components';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

const flavor__OLD: {
  colorScheme: ColorScheme__OLD;
  darkModeColorScheme?: ColorScheme__OLD;
} = require('./procivis__OLD');

const colorScheme__OLD: ColorScheme__OLD = flavor__OLD.colorScheme;
const darkModeColorScheme__OLD: ColorScheme__OLD | undefined =
  flavor__OLD.darkModeColorScheme;

const flavor: {
  colorScheme: ColorScheme;
  darkModeColorScheme?: ColorScheme;
} = require('./procivis');

const colorScheme: ColorScheme = flavor.colorScheme;
const darkModeColorScheme: ColorScheme | undefined = flavor.darkModeColorScheme;

export interface AppColorScheme__OLD extends ColorScheme__OLD {
  /** is a dark mode scheme */
  darkMode: boolean;
  /** used for native OS picker component */
  nativePickerText: string;
}

export interface AppColorScheme extends ColorScheme {
  /** is a dark mode scheme */
  darkMode: boolean;
  /** used for native OS picker component */
  nativePickerText: string;
}

export function useFlavorColorScheme__OLD(): AppColorScheme__OLD {
  const osDarkMode = useColorScheme() === 'dark';
  return useMemo(() => {
    const darkMode = Boolean(osDarkMode && darkModeColorScheme__OLD);
    const nativePickerText = osDarkMode ? '#ffffff' : '#000000';
    const scheme = darkMode ? darkModeColorScheme__OLD! : colorScheme__OLD;
    return { darkMode, nativePickerText, ...scheme };
  }, [osDarkMode]);
}

export function useFlavorColorScheme(): AppColorScheme {
  const osDarkMode = useColorScheme() === 'dark';
  return useMemo(() => {
    const darkMode = Boolean(osDarkMode && darkModeColorScheme);
    const nativePickerText = osDarkMode ? '#ffffff' : '#000000';
    const scheme = darkMode ? darkModeColorScheme! : colorScheme;
    return { darkMode, nativePickerText, ...scheme };
  }, [osDarkMode]);
}
