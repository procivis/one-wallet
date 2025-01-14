import { expect } from 'detox';
import { NativeMatcher } from 'detox/detox';
export default function ElementUtil() {
  return {
    isElementVisible: async function (elementId: string) {
      try {
        await expect(element(by.id(elementId))).toBeVisible();
        return true;
      } catch (error) {
        return false;
      }
    },

    tapVisibleElement: async function (locator: NativeMatcher) {
      try {
        await element(locator).atIndex(0).tap();
      } catch (error) {
        await expect(element(locator).atIndex(1)).toBeVisible();
        await element(locator).atIndex(1).tap();
      }
    },
  };
}
