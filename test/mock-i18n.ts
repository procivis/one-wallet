jest.mock('i18n-js', () => {
  const mock: Record<string, unknown> = {
    currentLocale: () => 'en',
    fallbacks: true,
    locale: 'en',
    t: (key: string) => `${key}.test`,
    translations: {},
  };

  mock.I18n = () => mock;

  return mock;
});
