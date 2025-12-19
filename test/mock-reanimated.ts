jest.mock('react-native-reanimated', () => {
  return {
    setUpTests: () => null,
  };
});
