export default abstract class SecurityScreen {
  static get screen() {
    return element(by.id('SecurityScreen'));
  }
  static get continueButton() {
    return element(by.id('SecurityScreen.continue'));
  }
}
