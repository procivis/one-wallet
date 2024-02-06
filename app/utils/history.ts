import {
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';

import { translate } from '../i18n';

export interface HistoryListItemGroup {
  date: string;
  entries: HistoryListItem[];
}

export const getQueryKeyFromListQueryParams = (
  queryParams: HistoryListQuery,
) => {
  const {
    credentialSchemaId,
    organisationId,
    page,
    pageSize,
    searchText,
    entityTypes,
  } = queryParams;
  return [
    credentialSchemaId,
    organisationId,
    page,
    pageSize,
    searchText,
    entityTypes,
  ];
};

export const groupEntriesByMonth = (
  entries: HistoryListItem[],
): HistoryListItemGroup[] => {
  const groupedEntries = entries.reduce(
    (result: Record<string, HistoryListItem[]>, entry: HistoryListItem) => {
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
