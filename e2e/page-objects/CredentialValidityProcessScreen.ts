import { expect } from 'detox';

export default abstract class CredentialValidityProcessScreen {
  static get screen() {
    return element(by.id('CredentialValidityProcessingScreen'));
  }

  static get closeButton() {
    return element(by.id('CredentialValidityProcessingScreen.close'));
  }

  static verifySuccessScreenVisible() {
    return expect(element(by.text('Credential is valid'))).toBeVisible();
  }

  static verifyRevokedScreenVisible() {
    return expect(element(by.text('Credential is revoked'))).toBeVisible();
  }
}
