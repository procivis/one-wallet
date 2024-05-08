import { expect } from 'detox';

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
      get header() {
        return element(by.id(`${id}.header`));
      },
      get revokedLabel() {
        return element(by.id(`${id}.header.revoked`));
      },
      get suspendedLabel() {
        return element(by.id(`${id}.header.suspended`));
      },
    };
  }

  static credential(credentialId: string) {
    return this.credentialEntry(credentialId);
  }

  static credentialName(credentialName: string) {
    return element(by.id(`WalletScreen.credential.${credentialName}`));
  }
  static get credentialList() {
    return element(by.id('WalletScreen.credentialList'));
  }

  static scrollTo(credentialSchemaName: string, index: number = 0) {
    const element = this.credentialName(credentialSchemaName).atIndex(index);
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('WalletScreen.credentialList'))
      .scroll(600, 'down');
  }

  static get search() {
    const field = element(by.id('WalletScreen.header.search'));
    return {
      clearText() {
        return element(by.id('WalletScreen.header.search.clear')).tap();
      },
      get element() {
        return field;
      },
      typeText(text: string) {
        return field.typeText(text);
      },
    };
  }

  static async verifyEmptyCredentialList() {
    const el = element(by.id('WalletScreen.credentialList'));
    await expect(el).toBeVisible();
    await expect(el).toHaveLabel(
      'No credentials yet Connect to an issuer to add your first credential. Scan QR Code',
    );
  }
}
