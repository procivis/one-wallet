export default abstract class RestoreBackupImportScreen {
  static get screen() {
    return element(by.id('RestoreBackupImportScreen'));
  }

  static get importButton() {
    return element(by.id('RestoreBackupImportScreen.mainButton'));
  }

  static get uploadFileButton() {
    return element(by.id('RestoreBackupImportScreen.file'));
  }
}
