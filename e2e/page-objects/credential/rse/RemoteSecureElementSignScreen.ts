export default class RemoteSecureElementSignScreen {
  static get screen() {
    return element(by.id('RemoteSecureElementSignScreen'));
  }

  static get error() {
    return element(by.id('RemoteSecureElementSignScreen.error'));
  }

  static digit(n: number) {
    return element(by.text(n.toString()));
  }
}
