export default abstract class PinCodeScreen {
  private static screen(screenTestID: string) {
    return {
      get screen() {
        return element(by.id(screenTestID));
      },
      digit(digit: number) {
        return element(by.id(`${screenTestID}.keypad.${digit}`));
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
