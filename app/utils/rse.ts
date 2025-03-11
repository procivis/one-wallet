import { OneError } from '@procivis/react-native-one-core';

const rseLockedErrors = [
  'Ubiqu main asset in wrong state: LOCKED',
  'com.ubiqu.eid.sdk.exceptions.AssetLockedException',
  'Asset is locked',
  'The asset is not in normal state',
  '(UBQKit.UbqKitError error 5.)',
];

export const isRSELockedError = (error: unknown): boolean => {
  if (!error || !(error instanceof OneError)) {
    return false;
  }
  return rseLockedErrors.some((cause) => error.cause?.includes(cause));
};
