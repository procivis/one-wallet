jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');

  rn.NativeModules.SettingsManager = {
    settings: { AppleLocale: 'en_US' },
  };
  rn.NativeModules.I18nManager.localeIdentifier = 'en_US';

  return rn;
});
