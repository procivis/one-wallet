const { getDefaultConfig } = require('metro-config');
const {
  applyConfigForLinkedDependencies,
} = require('@carimus/metro-symlinked-deps');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return applyConfigForLinkedDependencies(
    {
      resolver: {
        assetExts: assetExts.filter((ext) => ext !== 'svg'),
        sourceExts: [...sourceExts, 'svg'],
      },
      transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
      },
    },
    {
      blacklistLinkedModules: [
        '@react-native-community/blur',
        '@react-native/normalize-color',
        '@react-navigation/native',
        'react',
        'react-native',
        'react-native-safe-area-context',
        'react-native-svg',
      ],
      projectRoot: __dirname,
      resolveNodeModulesAtRoot: true,
    },
  );
})();
