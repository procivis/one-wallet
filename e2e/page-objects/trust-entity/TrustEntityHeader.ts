import { expect } from 'detox';

import { replaceBreakingHyphens } from '../../utils/utils';
import {
  waitForElementToHaveText,
  waitForElementVisible,
} from '../components/ElementUtil';

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
      await waitForElementToHaveText(
        element(by.id(`${this.testID}.entityName`)),
        replaceBreakingHyphens(didName),
        10000,
      );
    } else if (entityName) {
      await waitForElementToHaveText(
        element(by.id(`${this.testID}.entityName`)),
        entityName,
        10000,
      );
    }
    if (logo) {
      await expect(element(by.id(`${this.testID}.avatar.logo`))).toBeVisible();
    }
    await waitForElementVisible(
      element(by.id(`${this.testID}.statusIcon.${iconStatus}`)),
      10000,
    );
  }
}
