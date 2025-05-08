
import HistoryEntryList from '../components/HistoryEntryList';

export default class CredentialHistoryScreen {
  static get screen() {
    return element(by.id('CredentialHistoryScreen'));
  }

  static get backButton() {
    return element(by.id('CredentialHistoryScreen.back'));
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

  static get historyEntryList() {
    return new HistoryEntryList('CredentialHistoryScreen.list.item', 'CredentialHistoryScreen.list');
  }
}
