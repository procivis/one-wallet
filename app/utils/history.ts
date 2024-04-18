import {
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import moment, { Moment } from 'moment';

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

  const {
    entityId,
    action,
    entityTypes,
    createdDateFrom,
    createdDateTo,
    didId,
    credentialId,
    credentialSchemaId,
    searchText,
    searchType,
  } = queryParams;
  return [
    entityId,
    action,
    entityTypes,
    createdDateFrom,
    createdDateTo,
    didId,
    credentialId,
    credentialSchemaId,
    searchText,
    searchType,
  ];
};

export interface HistoryGroupByDaySection {
  data: HistoryListItemWithDid[];
  date: Moment;
  firstYearEntry: boolean;
}

export const groupEntriesByDay = (entries: HistoryListItemWithDid[]) => {
  const groupedEntries = entries.reduce(
    (result: HistoryGroupByDaySection[], entry: HistoryListItemWithDid) => {
      const entryDate = moment(entry.createdDate);

      const matchingEntry = result.find(({ date }) =>
        date.isSame(entryDate, 'day'),
      );
      if (matchingEntry) {
        matchingEntry.data.push(entry);
      } else {
        result.push({ data: [entry], date: entryDate, firstYearEntry: false });
      }

      return result;
    },
    [],
  );

  return groupedEntries
    .sort(({ date: a }, { date: b }) => b.valueOf() - a.valueOf())
    .map((item, index, list) => {
      item.firstYearEntry =
        !index || !list[index - 1].date.isSame(item.date, 'year');
      return item;
    });
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
