import { expect } from 'detox';

export default abstract class HistoryScreen {
  static get screen() {
    return element(by.id('HistoryScreen'));
  }

  static get back() {
    return element(by.id('HistoryScreen.header.back'));
  }

  private static historyEntry(index: number) {
    const id = `HistoryScreen.history.${index}`;
    const record = element(by.id(id));
    return {
      get element() {
        return record;
      },
    };
  }
  static get listItems() {
    return element(by.id('HistoryScreen.list'));
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
      clearText() {
        return field.clearText();
      },
      get element() {
        return field;
      },
      typeText(text: string) {
        return field.typeText(text);
      },
    };
  }

  static get filter() {
    return {
      close() {
        return element(by.id('HistoryScreen.filter.close')).tap();
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
