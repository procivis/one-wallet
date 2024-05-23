import CredentialCard from './components/CredentialCard';

export enum Action {
  CLOSE = 'Close',
  DELETE_CREDENTIAL = 'Delete credential',
  MORE_INFORMATION = 'More information',
}

export default abstract class CredentialDetailScreen {
  static get screen() {
    return element(by.id('CredentialDetailScreen'));
  }

  static get backButton() {
    return element(by.id('Screen.back'));
  }

  static action(actionText: Action) {
    return element(by.text(actionText));
  }

  static get actionButton() {
    return element(by.id('CredentialDetailScreen.header.action'));
  }

  private static historyEntry(itemId: number) {
    const id = `CredentialDetailScreen.history.${itemId}`;
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

  static get historySeeAllButton() {
    return element(by.id('CredentialDetailScreen.history.seeAll'));
  }

  static async openCredentialHistoryScreen() {
    await this.scrollTo(this.historySeeAllButton, 'down');
    await this.historySeeAllButton.tap();
  }

  static scrollTo(
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down',
  ) {
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialDetailScreen.scroll'))
      .scroll(100, direction);
  }

  static get credentialCard() {
    return CredentialCard('CredentialDetailScreen.detailsCard');
  }
}
