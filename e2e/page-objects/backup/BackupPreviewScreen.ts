import { expect } from 'detox';

export default abstract class BackupPreviewScreen {
  static get screen() {
    return element(by.id('CreateBackupPreviewScreen'));
  }

  static get continueButton() {
    return element(by.id('CreateBackupPreviewScreen.mainButton'));
  }

  static verifyCredentialVisible(credentialId: string) {
    return expect(
      element(by.id(`Credential.credential.${credentialId}`)),
    ).toBeVisible();
  }
}
