export default abstract class WalletScreen {
  static get screen() {
    return element(by.id('WalletScreen'));
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
}
