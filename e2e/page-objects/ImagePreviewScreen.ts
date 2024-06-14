export default abstract class ImagePreviewScreen {
  static get screen() {
    return element(by.id('ImagePreviewScreen'));
  }

  static get closeButton() {
    return element(by.id('ImagePreviewScreen.close'));
  }

  static get title() {
    return element(by.id('ImagePreviewScreen.header.title'));
  }
}
