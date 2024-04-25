export default abstract class CredentialDetailScreen {
  static get screen() {
    return element(by.id('CredentialDetailScreen'));
  }

  static get backButton() {
    return element(by.id('CredentialDetailScreen.header.back'));
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

  private static credentialLabel() {
    const id = 'CredentialDetailScreen.card.label';
    return {
      get element() {
        return element(by.id(id));
      },
      get revokedLabel() {
        return element(by.id(`${id}.revoked`));
      },
      get suspendedLabel() {
        return element(by.id(`${id}.suspended`));
      },
    };
  }

  static get credential() {
    return this.credentialLabel();
  }

  private static dataItem(id: string) {
    return {
      get element() {
        return element(by.id(id));
      },
      get value() {
        return element(by.id(`${id}.value`));
      },
    };
  }

  static get status() {
    return this.dataItem('CredentialDetailScreen.status');
  }

  static get revocationMethod() {
    return this.dataItem('CredentialDetailScreen.revocationMethod');
  }

  static get credentialFormat() {
    return this.dataItem('CredentialDetailScreen.format');
  }

  static action(actionText: string) {
    return element(by.text(actionText));
  }

  static claim(key: string) {
    return this.dataItem(`CredentialDetailScreen.claim.${key}`);
  }
}
