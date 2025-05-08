import BaseScreen from '../BaseScreen';
import CredentialCard from '../components/CredentialCard';
import HistoryEntryList from '../components/HistoryEntryList';

export enum Action {
  CLOSE = 'Close',
  DELETE_CREDENTIAL = 'Delete credential',
  MORE_INFORMATION = 'More information',
  REFRESH_CREDENTIAL = 'Refresh credential',
}

export default class CredentialDetailScreen {
  static get screen() {
    return new BaseScreen('CredentialDetailScreen');
  }

  static get backButton() {
    return element(by.id('CredentialDetailScreen.header.back'));
  }

  static action(actionText: Action) {
    return element(by.text(actionText));
  }

  static get actionButton() {
    return element(by.id('CredentialDetailScreen.header.action'));
  }

  static get historyEntryList() {
    return new HistoryEntryList('CredentialDetailScreen.history', 'CredentialDetailScreen.history');
  }

  static get historySeeAllButton() {
    return element(by.id('CredentialDetailScreen.history.seeAll'));
  }

  static async openCredentialHistoryScreen() {
    await this.scrollTo(this.historySeeAllButton, 'down');
    await this.historySeeAllButton.tap();
  }

  static scrollTo(
    this: void,
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down' = 'down',
  ) {
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialDetailScreen.scroll'))
      .scroll(100, direction, NaN, 0.4);
  }

  static get credentialCard() {
    return CredentialCard('CredentialDetailScreen.detailsCard');
  }
}
