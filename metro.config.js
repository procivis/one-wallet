const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const DETOX_BUILD = Boolean(process.env.RN_DETOX_BUILD);

const E2E_EXTS = DETOX_BUILD ? ['e2e.tsx'] : [];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...E2E_EXTS, ...sourceExts, 'svg'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    unstable_allowRequireContext: true,
  },
};

module.exports = withSentryConfig(mergeConfig(defaultConfig, config));
