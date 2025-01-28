import { PinLockModalLabels } from '@procivis/one-react-native-components';

import { translate } from '../i18n';

export const pinLockModalLabels = (): PinLockModalLabels => ({
  subtitle: (min: number, sec: number) =>
    translate('pinLockModal.subtitle', { min, sec }),
  title: (attempts: number) => translate('pinLockModal.title', { attempts }),
});
