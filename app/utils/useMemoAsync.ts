import { DependencyList, useEffect, useState } from 'react';

export function useMemoAsync<Value>(factory: () => Value | Promise<Value>, deps: DependencyList): Value | undefined;
export function useMemoAsync<Value, FallbackValue = Value | undefined>(
  factory: () => Value | Promise<Value>,
  deps: DependencyList,
  initialValue: FallbackValue,
  fallbackValue?: FallbackValue,
): Value | FallbackValue;

/**
 * Utility hook that can be used the same way as `useMemo` when the initializer needs to be async
 * @param factory Factory function to produce a value
 * @param deps Hook dependency list (to trigger an update)
 * @param initialValue Initial value before factory finishes producing a value (default = `undefined`)
 * @param fallbackValue Used when factory fails to produce a value (default = `initialValue`)
 * @returns
 */
export function useMemoAsync<Value, FallbackValue = Value | undefined>(
  factory: () => Value | Promise<Value>,
  deps: DependencyList,
  initialValue?: FallbackValue,
  fallbackValue?: FallbackValue,
): Value | FallbackValue | undefined {
  const [value, setValue] = useState<Value | FallbackValue | undefined>(initialValue);
  useEffect(() => {
    let canceled = false;
    const update = async () => {
      try {
        const result = await factory();
        if (!canceled) setValue(result);
      } catch (e) {
        if (!canceled) setValue(fallbackValue ?? initialValue);
      }
    };
    update();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
