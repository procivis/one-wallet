module.exports = {
  env: {
    production: {},
  },
  plugins: [
    'react-native-worklets-core/plugin',
    ['react-native-reanimated/plugin', { relativeSourceLocation: true }],
  ],
  presets: ['module:@react-native/babel-preset'],
};
