import { useCallback, useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';

/**
 * Loads a string from secure storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    return await Keychain.getGenericPassword({ service: key }).then(
      (credentials) => (credentials === false ? null : credentials.password),
    );
  } catch {
    return null;
  }
}

export function useLoadString(key: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState<string | null>(null);

  const handleLoad = useCallback(async () => {
    const value = await loadString(key);
    setValue(value);
    setIsLoading(false);
  }, [key]);

  useEffect(() => {
    handleLoad();
  }, [handleLoad]);

  return { isLoading, value };
}

/**
 * Saves a string to secure storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await Keychain.setGenericPassword('', value, { service: key });
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads something from secure storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load<Value = any>(key: string): Promise<Value | null> {
  try {
    const almostThere = await loadString(key);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return almostThere && JSON.parse(almostThere);
  } catch {
    return null;
  }
}

/**
 * Saves an object to secure storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: unknown): Promise<boolean> {
  return await saveString(key, JSON.stringify(value));
}

/**
 * Removes something from secure storage.
 *
 * @param key The key to kill.
 */
export async function remove(key: string): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: key });
    // eslint-disable-next-line no-empty
  } catch {}
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<void> {
  try {
    const services = await Keychain.getAllGenericPasswordServices();
    await Promise.all(services.map((service) => remove(service)));
    // eslint-disable-next-line no-empty
  } catch {}
}
