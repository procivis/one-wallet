// This is the first file that ReactNative will run when it starts up.
//
// We jump out of here immediately and into our main entry point instead.
//
// It is possible to have React Native load our main module first, but we'd have to
// change that in both AppDelegate.m and MainApplication.java.  This would have the
// side effect of breaking other tooling like mobile-center and react-native-rename.
//
// It's easier just to leave it here.

import 'react-native-url-polyfill/auto';

import { Animated, AppRegistry, Text, TextInput } from 'react-native';

import App from './app/app.tsx';

// global default for max font-scaling accessibility setting
Text.defaultProps = Object.assign(Text.defaultProps || {}, {
  maxFontSizeMultiplier: 2,
});
Animated.Text.defaultProps = Object.assign(Animated.Text.defaultProps || {}, {
  maxFontSizeMultiplier: 2,
});
TextInput.defaultProps = Object.assign(TextInput.defaultProps || {}, {
  maxFontSizeMultiplier: 2,
});

AppRegistry.registerComponent('Wallet', () => App);
export default App;
