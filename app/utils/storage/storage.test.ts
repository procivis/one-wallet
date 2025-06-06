/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { clear, load, loadString, remove, save, saveString } from './storage';

// fixtures
const VALUE_OBJECT = { x: 1 };
const VALUE_STRING = JSON.stringify(VALUE_OBJECT);

beforeEach(() =>
  (AsyncStorage.getItem as jest.Mock).mockReturnValue(
    Promise.resolve(VALUE_STRING),
  ),
);
afterEach(() => jest.clearAllMocks());

test('load', async () => {
  const value = await load('something');
  expect(value).toEqual(JSON.parse(VALUE_STRING));
});

test('loadString', async () => {
  const value = await loadString('something');
  expect(value).toEqual(VALUE_STRING);
});

test('save', async () => {
  await save('something', VALUE_OBJECT);
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('something', VALUE_STRING);
});

test('saveString', async () => {
  await saveString('something', VALUE_STRING);
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('something', VALUE_STRING);
});

test('remove', async () => {
  await remove('something');
  expect(AsyncStorage.removeItem).toHaveBeenCalledWith('something');
});

test('clear', async () => {
  await clear();
  expect(AsyncStorage.clear).toHaveBeenCalledWith();
});
