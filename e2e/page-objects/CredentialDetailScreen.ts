import CredentialCard from './components/CredentialCard';

export default abstract class CredentialDetailScreen {
  static get screen() {
    return element(by.id('CredentialDetailScreen'));
  }

  static get backButton() {
    return element(by.id('CredentialDetailScreen.header.back'));
  }

  static action(actionText: string) {
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

  static historySeeAllButton() {
    return element(by.id('CredentialDetailScreen.history.seeAll'));
  }

  static get credentialCard() {
    return CredentialCard('CredentialDetailScreen.card');
  }
}
