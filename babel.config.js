module.exports = {
  env: {
    production: {},
  },
  plugins: [
    ['react-native-reanimated/plugin', { relativeSourceLocation: true }],
  ],
  presets: ['module:metro-react-native-babel-preset'],
};
