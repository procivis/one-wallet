/* eslint-disable @typescript-eslint/naming-convention */

const DETOX_BUILD = Boolean(process.env.RN_DETOX_BUILD);

const detoxDependencies = DETOX_BUILD
  ? {
      'react-native-vision-camera': {
        platforms: {
          android: null,
        },
      },
    }
  : {};

module.exports = {
  assets: ['./assets/fonts/'],
  dependencies: {
    ...detoxDependencies,
    'react-native-camera': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};
