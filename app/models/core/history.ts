import { HistoryAction } from '@procivis/react-native-one-core';

const historyActionsDenyList = [
  HistoryAction.ACCEPTED,
  HistoryAction.ISSUED,
  HistoryAction.PENDING,
];

export const historyListActionsFilter = Object.values(HistoryAction).filter(
  (a) => !historyActionsDenyList.includes(a),
);
