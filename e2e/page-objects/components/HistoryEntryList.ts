import { expect } from 'detox';

export interface HistoryEntryRow {
  info: string;
  label: string;
}

export enum HistoryEntryEnum {
  CREDENTIAL_ACCEPTED = 'Credential accepted',
  CREDENTIAL_DELETED = 'Credential deleted',
  CREDENTIAL_ERRORED = 'Credential errored',
  CREDENTIAL_PENDING = 'Credential pending', 
  CREDENTIAL_REACTIVATED = 'Credential reactivated',
  CREDENTIAL_REJECTED = 'Credential rejected',
  CREDENTIAL_REVOKED = 'Credential revoked',
  CREDENTIAL_SUSPENDED = 'Credential suspended',

  PROOF_ACCEPTED = 'Proof accepted',
  PROOF_ERRORED = 'Proof errored',
  PROOF_REJECTED = 'Proof rejected',
  PROOF_REQUESTED = 'Proof requested'
}

export default class HistoryEntryList {
  id: string;
  scrollLayoutId: string;

  constructor(baseLayoutId: string, scrollLayoutId: string) {
    this.id = baseLayoutId;
    this.scrollLayoutId = scrollLayoutId;
  }

  historyRow(index: number) {
    return historyEntryItem(this.id, index);
  }

  async verifyHistoryLabels(labels: HistoryEntryEnum[]) {
    let index = 0;
    for (const label of labels) {
      await expect(historyEntryItem(this.id, index).label).toHaveText(label);
      index++;
    }
  }

  async verifyHistory(historyEntryRows: HistoryEntryRow[]) {
    let index = 0;
    for (const history of historyEntryRows) {
      await expect(historyEntryItem(this.id, index).label).toHaveText(
        history.label,
      );
      //await expect(historyEntryItem(this.id, index).info).toHaveText(history.info);
      index++;
    }
  }

  async scrollTo(row: number) {
    return waitFor(this.historyRow(row).element)
      .toBeVisible()
      .whileElement(by.id(this.scrollLayoutId))
      .scroll(300, 'down');
  }

  async viewHistoryDetail(row: number) {
    await this.scrollTo(row);
    await this.historyRow(row).label.tap();
  }
}

export function historyEntryItem(prefixId: string, index: number) {
  const id = `${prefixId}.${index}`;
  return {
    get element() {
      return element(by.id(id));
    },
    get info() {
      return element(by.id(`${id}.info`));
    },
    get label() {
      return element(by.id(`${id}.label`));
    },
    get timeLabel() {
      return element(by.id(`${id}.timeLabel`));
    },
  };
}
