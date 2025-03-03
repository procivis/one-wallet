export default class RemoteSecureElementPinLayout {
  static digit(n: number) {
    return element(by.text(n.toString()));
  }

  static async fillRemotePINCode(PINCode: string) {
    for (const char of PINCode) {
      const digit = Number(char);
      await this.digit(digit).tap();
    }
  }
}
