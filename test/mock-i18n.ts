jest.mock('i18n-js', () => {
  return {
    t: (key: string) => `${key}.test`,
  };
});

export {};
