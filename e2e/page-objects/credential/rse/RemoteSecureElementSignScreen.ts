export default class RemoteSecureElementSignScreen {
  static get screen() {
    return element(by.id('RemoteSecureElementSignScreen'));
  }

  static digit(n: number) {
    return element(by.text(n.toString()));
  }
}
