import { device, expect } from 'detox';

export default abstract class HistoryScreen {
  static get screen() {
    return element(by.id('HistoryScreen'));
  }

  static get back() {
    return element(by.id('HistoryScreen.back'));
  }

  private static historyEntry(index: number) {
    const id = `HistoryScreen.list.item.${index}`;
    const record = element(by.id(id));
    return {
      get element() {
        return record;
      },
    };
  }

  static history(index: number) {
    return this.historyEntry(index);
  }

  static verifyContainsText(text: string) {
    return expect(element(by.text(text))).toBeVisible();
  }

  static get searchField() {
    const field = element(by.id('HistoryScreen.search'));
    return {
      get clearButton() {
        return element(by.id('HistoryScreen.search.clear'));
      },
      clearText() {
        return field.clearText();
      },
      get element() {
        return field;
      },
      async typeText(text: string) {
        if (device.getPlatform() === 'ios') {
          await field.tap(); // this opens the software keyboard
        }
        return field.typeText(text);
      },
    };
  }

  static get filter() {
    return {
      close() {
        return element(by.id('CredentialSchemaPicker.close')).tap();
      },
      open() {
        return element(by.id('HistoryScreen.filter')).tap();
      },
      scrollTo(credentialName: string) {
        return waitFor(element(by.text(credentialName)))
          .toBeVisible()
          .whileElement(by.id('HistoryScreen.filter.scroll'))
          .scroll(500, 'down', NaN, 0.85);
      },
    };
  }

  static scrollTo(index: number) {
    const element = this.historyEntry(index).element;
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('HistoryScreen.list'))
      .scroll(600, 'down', NaN, 0.85);
  }
}
