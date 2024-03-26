import {
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';

import { translate } from '../i18n';
import { HistoryListItemWithDid } from '../models/core/history';

export interface HistoryListItemGroup {
  date: string;
  entries: HistoryListItemWithDid[];
}

export const getQueryKeyFromListQueryParams = (
  queryParams?: Partial<HistoryListQuery>,
) => {
  if (!queryParams) {
    return [];
  }
  const { credentialSchemaId, searchText, entityTypes } = queryParams;
  return [credentialSchemaId, searchText, entityTypes];
};

export const groupEntriesByMonth = (
  entries: HistoryListItemWithDid[],
): HistoryListItemGroup[] => {
  const groupedEntries = entries.reduce(
    (
      result: Record<string, HistoryListItemWithDid[]>,
      entry: HistoryListItemWithDid,
    ) => {
      const [year, month] = entry.createdDate.split('-');
      const date = `${year}-${month}`;

      if (!result[date]) {
        result[date] = [];
      }

      result[date].push(entry);
      return result;
    },
    {},
  );

  return Object.keys(groupedEntries).map((date) => {
    return {
      date,
      entries: groupedEntries[date],
    };
  });
};

export const getEntryTitle = (entry: HistoryListItem) => {
  return `${translate(`history.entityType.${entry.entityType}`)} ${translate(
    `history.action.${entry.action}`,
  )}`;
};
