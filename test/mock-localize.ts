jest.mock('react-native-localize', () => {
  return {
    findBestLanguageTag: jest.fn(),
  };
});

export {};
