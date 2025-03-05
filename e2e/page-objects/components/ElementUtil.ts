import { expect } from 'detox';
import { NativeElement, NativeMatcher } from 'detox/detox';

export async function isElementVisible(elementId: string) {
  try {
    await expect(element(by.id(elementId))).toBeVisible();
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
  timeoutInMinisecond: number,
) {
  await waitFor(element).toBeVisible().withTimeout(timeoutInMinisecond);
}

export async function waitForElementToHaveText(
  element: NativeElement,
  text: string,
  timeoutInMinisecond: number,
) {
  await waitFor(element).toHaveText(text).withTimeout(timeoutInMinisecond);
}

export async function waitForElementIsNotPresent(
  element: NativeElement,
  timeoutInMinisecond: number,
) {
  await waitFor(element).not.toBeVisible().withTimeout(timeoutInMinisecond);
}

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
