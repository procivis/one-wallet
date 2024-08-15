import { expect } from 'detox';

import CredentialCard from './components/CredentialCard';

export default abstract class WalletScreen {
  static get screen() {
    return element(by.id('WalletScreen'));
  }

  static get settingsButton() {
    return element(by.id('WalletScreen.header.action-settings')).atIndex(0);
  }

  static credential(credentialId: string) {
    return CredentialCard(`WalletScreen.credential.${credentialId}`);
  }

  static async openDetailScreen(
    credentialIdOrName: string,
    atIndex: number = 0,
  ) {
    await element(
      by.id(`WalletScreen.credential.${credentialIdOrName}.openDetail`),
    )
      .atIndex(atIndex)
      .tap();
  }

  static credentialName(credentialName: string) {
    return element(by.text(credentialName));
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
    await expect(element(by.id('WalletScreen.empty.title'))).toHaveText(
      'No credentials yet',
    );
    await expect(element(by.id('WalletScreen.empty.subtitle'))).toHaveText(
      'Connect to an issuer to add your first credential.',
    );
  }

  static get scanQRCodeButton() {
    return element(by.id('WalletScreen.scanQrCode'));
  }
}
