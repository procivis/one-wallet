import { expect } from 'detox';

import { replaceBreakingHyphens } from '../../utils/utils';

interface EntityDetailHeaderProps {
  didName?: string;
  entityName?: string;
  iconStatus?: 'trusted' | 'notTrusted';
  logo?: boolean;
  subline?: string;
}

export default class TrustEntityHeader {
  constructor(private testID: string) {}
  async verifyEntityDetailHeader({
    entityName,
    iconStatus = 'trusted',
    logo,
    didName,
  }: EntityDetailHeaderProps) {
    if (didName) {
      await waitFor(element(by.id(`${this.testID}.entityName`)))
        .toHaveText(replaceBreakingHyphens(didName))
        .withTimeout(10000);
    } else if (entityName) {
      await waitFor(element(by.id(`${this.testID}.entityName`)))
        .toHaveText(entityName)
        .withTimeout(10000);
    }
    if (logo) {
      await expect(element(by.id(`${this.testID}.avatar.logo`))).toBeVisible();
    }
    console.log(`${this.testID}.statusIcon.${iconStatus}`);
    await expect(
      element(by.id(`${this.testID}.statusIcon.${iconStatus}`)),
    ).toBeVisible();
  }
}
