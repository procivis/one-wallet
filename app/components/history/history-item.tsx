import {
  TouchableOpacity,
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
import { getEntryTitle } from '../../utils/history';
import { HistoryActionIcon, HistoryActionIconType } from '../icon/history-icon';

const getLabelAndIconForAction = (historyItem: HistoryListItem) => {
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
  absoluteTime?: boolean;
  item: HistoryListItemWithDid;
  last?: boolean;
  onPress?: (item: HistoryListItemWithDid) => void;
  style?: StyleProp<ViewStyle>;
}

export const HistoryItem: FC<HistoryItemProps> = ({
  item,
  last,
  style,
  absoluteTime,
  onPress,
}) => {
  const colorScheme = useAppColorScheme();
  const { label, icon } = getLabelAndIconForAction(item);
  const time = moment(item.createdDate);
  const timeLabel = absoluteTime ? time.format('H:mm') : time.fromNow();

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={() => onPress?.(item)}
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
        <Typography color={colorScheme.text} preset="s" style={styles.label}>
          {label}
        </Typography>
        <Typography
          color={colorScheme.text}
          numberOfLines={1}
          preset="s/line-height-small"
          style={styles.shaded}
        >
          {item.did}
        </Typography>
      </View>
      <Typography
        color={colorScheme.text}
        preset="xs/line-height-small"
        style={styles.shaded}
      >
        {timeLabel}
      </Typography>
    </TouchableOpacity>
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
  label: {
    marginBottom: 2,
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
