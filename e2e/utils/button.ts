import { expect } from 'detox';

/**
 * Check whether button element is disabled/enabled
 */
export async function verifyButtonEnabled(buttonElement: Detox.NativeElement, enabled: boolean) {
  const buttonAttributes = await buttonElement.getAttributes();
  if ('identifier' in buttonAttributes) {
    const buttonStateMarker = element(by.id(`${buttonAttributes.identifier}.${enabled ? 'enabled' : 'disabled'}`));
    await expect(buttonStateMarker).toBeVisible();
  } else {
    throw Error('Invalid Button element');
  }
}
