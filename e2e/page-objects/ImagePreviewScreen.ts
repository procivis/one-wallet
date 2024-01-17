export default abstract class ImagePreviewScreen {
  static get screen() {
    return element(by.id('ImagePreviewScreen'));
  }

  static get backButton() {
    return element(by.id('ImagePreviewScreen.header.back'));
  }

  static get title() {
    return element(by.id('ImagePreviewScreen.header.title'));
  }
}
