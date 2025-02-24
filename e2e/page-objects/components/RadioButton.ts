import { expect } from 'detox';

export enum SelectorStatus {
  Disabled = 'disabled',
  Empty = 'empty',
  Rejected = 'rejected',
  Required = 'required',
  SelectedCheckmark = 'selectedCheckmark',
  SelectedRadio = 'selectedRadio',
}

export default class RadioButon<Values extends string = string> {
  private readonly optionIds: string[];

  constructor(optionIds: string[]) {
    this.optionIds = optionIds;
  }

  async select(value: Values): Promise<void> {
    await element(by.id(value)).tap();
  }

  selector(value: Values) {
    const id = `${value}.selector`;
    return {
      get element() {
        return element(by.id(id));
      },
      status(status: SelectorStatus) {
        return element(by.id(`${id}.status.${status}`));
      },
    };
  }

  async verifySelected(value: Values): Promise<void> {
    await expect(this.selector(value).element).toBeVisible();
    await waitFor(this.selector(value).status(SelectorStatus.SelectedRadio))
      .toBeVisible()
      .withTimeout(1000);
  }
}
