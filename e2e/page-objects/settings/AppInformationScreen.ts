export default abstract class AppInformationScreen {
  static get screen() {
    return element(by.id('AppInformationScreen'));
  }

  static get back() {
    return element(by.id('AppInformationScreen.back'));
  }
}
