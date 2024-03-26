export default abstract class WalletScreen {
  static get screen() {
    return element(by.id('WalletScreen'));
  }

  static get settingsButton() {
    return element(by.id('WalletScreen.header.action-settings'));
  }

  private static credentialEntry(credentialId: string) {
    const id = `WalletScreen.credential.${credentialId}`;
    return {
      get element() {
        return element(by.id(id));
      },
      get revokedLabel() {
        return element(by.id(`${id}.revoked`));
      },
    };
  }

  static credential(credentialId: string) {
    return this.credentialEntry(credentialId);
  }

  static credentialName(credentialName: string) {
    return element(by.text(credentialName));
  }
}
