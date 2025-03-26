import { expect } from 'detox';
import { NativeElement, NativeMatcher } from 'detox/detox';

import { DEFAULT_WAIT_TIME } from '../../utils/init';

export async function isElementVisible(testID: string) {
  try {
    await expect(element(by.id(testID))).toBeVisible();
    return true;
  } catch (_error) {
    return false;
  }
}

export async function tapVisibleElement(locator: NativeMatcher) {
  try {
    await element(locator).atIndex(0).tap();
  } catch (_error) {
    await expect(element(locator).atIndex(1)).toBeVisible();
    await element(locator).atIndex(1).tap();
  }
}

export async function waitForElementVisible(
  element: NativeElement,
  timeout: number = DEFAULT_WAIT_TIME,
  visiblePercent?: number,
) {
  await waitFor(element).toBeVisible(visiblePercent).withTimeout(timeout);
}

export async function waitForElementPresent(
  element: NativeElement,
  timeout: number = DEFAULT_WAIT_TIME,
) {
  await waitFor(element).toExist().withTimeout(timeout);
}

export async function waitForElementToHaveText(
  element: NativeElement,
  text: string,
  timeout: number = DEFAULT_WAIT_TIME,
) {
  await waitFor(element).toHaveText(text).withTimeout(timeout);
}

export async function waitForElementIsNotPresent(
  element: NativeElement,
  timeout: number = DEFAULT_WAIT_TIME,
) {
  await waitFor(element).not.toExist().withTimeout(timeout);
}

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
