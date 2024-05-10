import { expect } from 'detox';

import { Tip } from '../backup/CreateBackupSetPasswordScreen';

export default function PasswordStrength(testID: string) {
  return {
    indicator: (index: number, colorScheme: 'satisfied' | 'unsatisfied') => {
      return element(by.id(`${testID}.indicator.${index}.${colorScheme}`));
    },
    passwordStrengthTipIcon: (tip: Tip) => {
      return element(by.id(`${testID}.${tip}.successIcon`));
    },
    passwordStrengthTipText: (tip: Tip) => {
      return element(by.id(`${testID}.${tip}.tip`));
    },
    verifyIndicatorLevel: async function (
      colorScheme: 'satisfied' | 'unsatisfied',
      levelNumbers: number[],
    ) {
      if (colorScheme === 'satisfied') {
        for (const n of levelNumbers) {
          await expect(this.indicator(n, colorScheme)).toBeVisible();
        }
      } else {
        for (const n of levelNumbers) {
          await expect(this.indicator(n, colorScheme)).toBeVisible();
        }
      }
    },
    verifyTipsAreVisible: async function (tips: Tip[]) {
      for (const tip of tips) {
        await expect(this.passwordStrengthTipIcon(tip)).toBeVisible();
      }
    },
  };
}
