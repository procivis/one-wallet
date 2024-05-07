export default abstract class InvitationProcessScreen {
  static get screen() {
    return element(by.id('InvitationProcessScreen'));
  }

  static get closeButton() {
    return element(by.id('Screen.closeButton'));
  }

  static get infoButton() {
    return element(by.id('Screen.infoButton'));
  }
}
