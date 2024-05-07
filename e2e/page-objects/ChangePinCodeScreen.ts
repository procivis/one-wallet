export default abstract class PinCodeChangeScreen {
  static get screen() {
    return element(by.id('PinCodeChangeScreen'));
  }

  static get back() {
    return element(by.id('PinCodeChangeScreen.back'));
  }

  static get title() {
    return element(by.id('PinCodeChangeScreen.title'));
  }
  static get instruction() {
    return element(by.id('PinCodeChangeScreen.instruction'));
  }

  static get error() {
    return element(by.id('PinCodeChangeScreen.error'));
  }

  static get keypad() {
    return element(by.id('PinCodeChangeScreen.keypad'));
  }
}
