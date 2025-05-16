import { expect } from 'detox';

import { HistoryEntryEnum } from "./components/HistoryEntryList";

export enum CredentialCardStatus{
  DELETED = 'deleted',
  REVOKED = 'revoked',
}

export default class HistoryDetailScreen {
  static get screen() {
    return element(by.id('HistoryDetailScreen'));
  }

  static get infoButton() {
    return element(by.id('HistoryDetailScreen.header.info'));
  }

  static get back() {
    return element(by.id('HistoryDetailScreen.header.back'));
  }

  static async verifyAction(historyEntry: HistoryEntryEnum) {
    switch(historyEntry){
      case HistoryEntryEnum.CREDENTIAL_ACCEPTED:
        return expect(element(by.id('HistoryDetailScreen.action.ACCEPTED'))).toBeVisible();
      case HistoryEntryEnum.CREDENTIAL_PENDING:
        return expect(element(by.id('HistoryDetailScreen.action.PENDING'))).toBeVisible();
      case HistoryEntryEnum.CREDENTIAL_REACTIVATED:
        return expect(element(by.id('HistoryDetailScreen.action.REACTIVATED'))).toBeVisible();
      case HistoryEntryEnum.CREDENTIAL_REVOKED:
        return expect(element(by.id('HistoryDetailScreen.action.REVOKED'))).toBeVisible();
      case HistoryEntryEnum.CREDENTIAL_SUSPENDED:
        return expect(element(by.id('HistoryDetailScreen.action.SUSPENDED'))).toBeVisible();
    }
    return;
  }

  static async veifyCredentialCardStatus(testID: string, status: CredentialCardStatus){
    if(status === CredentialCardStatus.DELETED)
      return expect(element(by.id(`DeletedCredentialCard.${testID}.header.primaryDetail`))).toBeVisible();
    return expect(element(by.id(`Credential.credential.${testID}.card.header.${status}`))).toBeVisible();
  }

  static scrollTo(
    this: void,
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down' = 'down',
  ) {
    return waitFor(element)
      .toBeVisible()
      .whileElement(by.id('HistoryDetailScreen.scroll'))
      .scroll(100, direction, NaN, 0.4);
  }
}
