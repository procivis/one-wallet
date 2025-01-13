import { expect } from 'detox';

import CredentialCard from './components/CredentialCard';

export default class WalletScreen {
  static get screen() {
    return element(by.id('WalletScreen'));
  }

  static get settingsButton() {
    return element(by.id('WalletScreen.header.action-settings')).atIndex(0);
  }

  private static get scroll() {
    return by.id('WalletScreen.scroll');
  }

  static async credentialAtIndex(index: number) {
    const cardAttributes = await element(
      by.id(/^WalletScreen.credential.[\w-]+.card$/),
    )
      .atIndex(index)
      .getAttributes();
    const id = (
      'elements' in cardAttributes
        ? cardAttributes.elements[0].identifier
        : cardAttributes.identifier
    ).replace('.card', '');
    return CredentialCard(id);
  }

  static async openDetailScreen(index: number) {
    const credentialCard = await this.credentialAtIndex(index);
    await credentialCard.openDetail();
  }

  static credentialName(credentialName: string) {
    return element(by.text(credentialName));
  }

  static scrollTo(credentialSchemaName: string, index: number = 0) {
    const element = this.credentialName(credentialSchemaName).atIndex(index);
    return waitFor(element)
      .toBeVisible()
      .whileElement(this.scroll)
      .scroll(600, 'down', NaN, 0.5);
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
  private static get emptyDashboard() {
    return {
      get subtitle() {
        return element(by.id('WalletScreen.empty.subtitle'));
      },
      get title() {
        return element(by.id('WalletScreen.empty.title'));
      },
    };
  }

  static async verifyEmptyCredentialList() {
    await waitFor(this.emptyDashboard.title)
      .toHaveText('No credentials yet')
      .withTimeout(2000);
    await expect(this.emptyDashboard.subtitle).toHaveText(
      'Connect to an issuer to add your first credential.',
    );
    await expect(this.scanQRCodeButton).toBeVisible();
  }

  static get scanQRCodeButton() {
    return element(by.id('WalletScreen.scanQrCode'));
  }
}
