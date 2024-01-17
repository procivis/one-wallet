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

  static log(itemId: string) {
    return element(by.id(`CredentialDetailScreen.log.${itemId}`));
  }

  static action(actionText: string) {
    return element(by.text(actionText));
  }

  static claim(key: string) {
    return this.dataItem(`CredentialDetailScreen.claim.${key}`);
  }
}
