export default abstract class PinCodeSetScreen {
  static get screen() {
    return element(by.id('PinCodeSetScreen'));
  }

  static get closeButton() {
    return element(by.id('PinCodeSetScreen.close'));
  }
}
