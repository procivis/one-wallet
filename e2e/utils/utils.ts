import { NativeElementActions } from 'detox/detox';
import { v4 as uuidv4 } from 'uuid';

export const objectToQueryParams = (obj: Record<string, unknown>): string => {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // If the value is an array, append each item separately
        value.forEach((item) => {
          if (item !== undefined) {
            params.append(key, item as string);
          }
        });
      } else {
        // If the value is not an array, append it directly
        params.append(key, value as string);
      }
    }
  });

  return params.toString();
};

export const shortUUID = () => {
  return uuidv4().split('-')[0];
};

export async function getIdentifier(element: NativeElementActions) {
  const attributes = await element.getAttributes();
  if ('identifier' in attributes) {
    return attributes.identifier;
  } else {
    throw new Error('Mutliple elements');
  }
}

export const replaceBreakingHyphens = (str: string): string => str.replace(/-/g, '\u2011');
