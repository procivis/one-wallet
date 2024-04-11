export default abstract class PinCodeScreen {
  private static screen(screenTestID: string) {
    return {
      digit(digit: number) {
        return element(by.id(`${screenTestID}.keypad.${digit}`));
      },
      get error() {
        return element(by.id(`${screenTestID}.error`));
      },
      get screen() {
        return element(by.id(screenTestID));
      },
    };
  }

  static get Initialization() {
    return this.screen('PinCodeInitializationScreen');
  }

  static get Check() {
    return this.screen('PinCodeCheckScreen');
  }
}
