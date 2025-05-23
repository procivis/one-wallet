import { expect } from 'detox';

import { replaceBreakingHyphens } from '../../utils/utils';

interface EntityDetailHeaderProps {
  entityName: string;
  iconStatus?: 'trusted' | 'notTrusted';
  logo?: boolean;
  subline?: string;
}

export default function TrustEntityHeader(testID: string) {
  return {
    async verifyEntityDetailHeader({entityName, iconStatus = 'trusted', logo, subline}: EntityDetailHeaderProps) {
      await waitFor(element(by.id(`${testID}.entityName`))).toHaveText(replaceBreakingHyphens(entityName)).withTimeout(10000);
      if (subline) {
        await expect(element(by.id(`${testID}.subline`))).toHaveText(replaceBreakingHyphens(subline));
      }
      if (logo) {
        await expect(
          element(by.id(`${testID}.avatar.logo`)),
        ).toBeVisible();
      }
      await expect(element(by.id(`${testID}.statusIcon.${iconStatus}`))).toBeVisible();
    },
  };
}
