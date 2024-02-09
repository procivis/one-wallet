export default abstract class HistoryDetailScreen {
  static get screen() {
    return element(by.id('HistoryDetailScreen'));
  }

  static get back() {
    return element(by.id('HistoryDetailScreen.header.back'));
  }
}
