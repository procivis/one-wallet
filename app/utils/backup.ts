import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

export const getBackupFileName = (): string => {
  return `procivis-one-backup-${uuidv4()}.zip`;
};
