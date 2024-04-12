export default abstract class StatusCheckResultScreen {
  static get screen() {
    return element(by.id('StatusCheckResultScreen'));
  }

  static get closeButton() {
    return element(by.id('StatusCheckResultScreen.close'));
  }
}
