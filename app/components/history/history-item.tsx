import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HistoryActionEnum,
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import moment from 'moment';
import React, { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { translate } from '../../i18n';
import { HistoryListItemWithDid } from '../../models/core/history';
import { HistoryActionIcon, HistoryActionIconType } from '../icon/history-icon';

const getLabelAndIconForAction = (historyItem: HistoryListItem) => {
  if (historyItem.entityType === HistoryEntityTypeEnum.PROOF) {
    return {
      icon: <HistoryActionIcon type={HistoryActionIconType.Share} />,
      label: translate('credentialHistory.shared'),
    };
  }

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
      return {
        icon: <HistoryActionIcon type={HistoryActionIconType.Issue} />,
        label: translate('credentialHistory.accepted'),
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
};

const HistoryItem: FC<{
  absoluteTime?: boolean;
  historyItem: HistoryListItemWithDid;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ historyItem, last, style, absoluteTime }) => {
  const colorScheme = useAppColorScheme();

  const display = getLabelAndIconForAction(historyItem);
  if (!display) {
    return null;
  }

  const { label, icon } = display;
  const time = moment(historyItem.createdDate);
  const timeLabel = absoluteTime ? time.format('H:mm') : time.fromNow();

  return (
    <View
      style={[
        styles.historyItemContainer,
        {
          backgroundColor: colorScheme.white,
          borderColor: colorScheme.background,
        },
        last && styles.last,
        style,
      ]}
    >
      {icon}
      <View style={styles.labelAndDid}>
        <Typography color={colorScheme.text} preset="s">
          {label}
        </Typography>
        <Typography
          color={colorScheme.text}
          numberOfLines={1}
          preset="s/line-height-small"
          style={styles.shaded}
        >
          {historyItem.did}
        </Typography>
      </View>
      <Typography
        color={colorScheme.text}
        preset="xs/line-height-small"
        style={styles.shaded}
      >
        {timeLabel}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  historyItemContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingRight: 8,
    paddingVertical: 12,
  },
  labelAndDid: {
    flex: 1,
    marginHorizontal: 12,
  },
  last: {
    borderBottomWidth: 0,
  },
  shaded: {
    opacity: 0.7,
  },
});

export default HistoryItem;
