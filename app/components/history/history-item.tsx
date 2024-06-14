import {
  HistoryActionIcon,
  HistoryActionIconType,
  HistoryListItem as HistoryListItemView,
} from '@procivis/one-react-native-components';
import {
  HistoryActionEnum,
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import moment from 'moment';
import React, { FC, useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { translate } from '../../i18n';
import { HistoryListItemWithDid } from '../../models/core/history';
import { getEntryTitle } from '../../utils/history';

export const getHistoryItemLabelAndIconForAction = (
  historyItem: HistoryListItem,
) => {
  switch (historyItem.action) {
    case HistoryActionEnum.PENDING:
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Issue} />,
        label: translate('credentialHistory.pending'),
      };
    case HistoryActionEnum.OFFERED:
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Issue} />,
        label: translate('credentialHistory.offered'),
      };
    case HistoryActionEnum.ACCEPTED:
      if (historyItem.entityType === HistoryEntityTypeEnum.PROOF) {
        return {
          icon: <HistoryActionIcon type={HistoryActionIconType.Share} />,
          label: translate('credentialHistory.shared'),
        };
      }
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Issue} />,
        label: translate('credentialHistory.accepted'),
      };
    case HistoryActionEnum.ERRORED:
      if (historyItem.entityType === HistoryEntityTypeEnum.PROOF) {
        return {
          icon: <HistoryActionIcon type={HistoryActionIconType.Error} />,
          label: translate('credentialHistory.shareError'),
        };
      }
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Error} />,
        label: translate('credentialHistory.offerError'),
      };
    case HistoryActionEnum.REJECTED:
      if (historyItem.entityType === HistoryEntityTypeEnum.PROOF) {
        return {
          icon: <HistoryActionIcon type={HistoryActionIconType.ShareReject} />,
          label: translate('credentialHistory.shareRejected'),
        };
      }
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.IssueReject} />,
        label: translate('credentialHistory.offerRejected'),
      };
    case HistoryActionEnum.REVOKED:
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Revoke} />,
        label: translate('credentialHistory.revoked'),
      };
    case HistoryActionEnum.SUSPENDED:
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Suspend} />,
        label: translate('credentialHistory.suspended'),
      };
    case HistoryActionEnum.REACTIVATED:
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Revalidate} />,
        label: translate('credentialHistory.revalidated'),
      };
  }

  return {
    icon: <HistoryActionIcon type={HistoryActionIconType.Issue} />,
    label: getEntryTitle(historyItem),
  };
};

export interface HistoryItemProps {
  item: HistoryListItemWithDid;
  last?: boolean;
  onPress?: (item: HistoryListItemWithDid) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const HistoryItem: FC<HistoryItemProps> = ({
  item,
  last,
  onPress,
  style,
  testID,
}) => {
  const { label, icon } = getHistoryItemLabelAndIconForAction(item);
  const time = moment(item.createdDate);
  const timeLabel = time.fromNow();

  const pressHandler = useCallback(() => {
    onPress?.(item);
  }, [onPress, item]);

  return (
    <HistoryListItemView
      icon={icon}
      info={item.did ?? ''}
      label={label}
      last={last}
      onPress={pressHandler}
      style={style}
      testID={testID}
      time={timeLabel}
    />
  );
};
