import { expect } from 'detox';

export default class Button {
  constructor(private testID: string) {}

  get element() {
    return element(by.id(this.testID));
  }

  async verifyEnabled(enabled: boolean = true) {
    const buttonAttributes = await this.element.getAttributes();
    if ('identifier' in buttonAttributes) {
      const buttonStateMarker = element(
        by.id(
          `${buttonAttributes.identifier}.${enabled ? 'enabled' : 'disabled'}`,
        ),
      );
      await expect(buttonStateMarker).toBeVisible();
    } else {
      throw Error('Invalid Button element');
    }
  }

  async verifyIsVisible(visible: boolean = true) {
    if (visible) {
      await expect(this.element).toBeVisible();
    } else {
      await expect(this.element).not.toBeVisible();
    }
  }

  async tap(duration?: number) {
    if (duration) {
      await this.element.longPress(duration);
    } else {
      await this.element.tap();
    }
  }
}
