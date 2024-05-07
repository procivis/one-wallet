export default abstract class DeleteWalletScreen {
  static get screen() {
    return element(by.id('DeleteWalletScreen'));
  }
  static get back() {
    return element(by.id('Screen.back'));
  }

  static get checkbox() {
    return element(by.id('DeleteWalletScreen.checkbox'));
  }

  static get deleteButton() {
    return element(by.id('DeleteWalletScreen.mainButton'));
  }
}
