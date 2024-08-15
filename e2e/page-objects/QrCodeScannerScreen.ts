export default abstract class QRCodeScannerMockScreen {
  static get screen() {
    return element(by.id('QRCodeScannerScreen'));
  }

  static get uriInput() {
    return element(by.id('QRCodeScannerMockScreen.textInput'));
  }

  static get scanUriButton() {
    return element(by.id('QRCodeScannerMockScreen.scanUri'));
  }

  static get back() {
    return element(by.id('QRCodeScannerMockScreen.back'));
  }
}
