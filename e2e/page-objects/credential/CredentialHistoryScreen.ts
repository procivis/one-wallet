import { expect } from 'detox';

export default abstract class CredentialHistoryScreen {
  static get screen() {
    return element(by.id('CredentialHistoryScreen'));
  }

  static get backButton() {
    return element(by.id('CredentialHistoryScreen.header.back'));
  }

  static get search() {
    const field = element(by.id('CredentialHistoryScreen.search'));
    return {
      clearText() {
        return element(by.id('CredentialHistoryScreen.search.clear')).tap();
      },
      get element() {
        return field;
      },
      typeText(text: string) {
        return field.typeText(text);
      },
    };
  }
  static scrollTo(element: Detox.IndexableNativeElement) {
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialHistoryScreen.list'))
      .scroll(300, 'down');
  }

  private static historyEntry(itemId: number) {
    const id = `CredentialHistoryScreen.list.item.${itemId}`;
    return {
      get did() {
        return element(by.id(`${id}.did`));
      },
      get element() {
        return element(by.id(id));
      },
      get label() {
        return element(by.id(`${id}.label`));
      },
      get time() {
        return element(by.id(`${id}.timeLabel`));
      },
    };
  }

  static history(itemId: number) {
    return this.historyEntry(itemId);
  }
  static async verifyHistoryLabels(labels: string[]) {
    let index = 0;
    for (const label of labels) {
      await expect(this.history(index).label).toHaveText(label);
      index++;
    }
  }
}
