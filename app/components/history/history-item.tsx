import {
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { HistoryActionEnum } from '@procivis/react-native-one-core';
import moment from 'moment';
import React, { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { translate } from '../../i18n';
import { HistoryListItemWithDid } from '../../models/core/history';
import { IssuedSuccessIcon } from '../icon/history-icon';

const getLabelAndIconForAction = (action: HistoryActionEnum) => {
  switch (action) {
    case HistoryActionEnum.ACCEPTED:
      return {
        icon: <IssuedSuccessIcon />,
        label: `${translate('history.entityType.CREDENTIAL')} ${translate(
          'history.action.ISSUED',
        )}`,
      };
    default:
      return {
        icon: null,
        label: action,
      };
  }
};

const HistoryItem: FC<{
  historyItem: HistoryListItemWithDid;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ historyItem, last, style }) => {
  const colorScheme = useAppColorScheme();

  const momentDate = moment(historyItem.createdDate).fromNow();
  const { label, icon } = getLabelAndIconForAction(historyItem.action);

  return (
    <View
      style={[
        styles.historyItemContainer,
        {
          backgroundColor: colorScheme.white,
          borderColor: colorScheme.background,
        },
        !last && styles.bottomBorder,
        style,
      ]}
    >
      <View style={styles.iconAndLabelWithDid}>
        {icon}
        <View style={styles.labelAndDid}>
          <Typography>{label}</Typography>
          <Typography size="sml">
            {historyItem.did?.slice(0, 20) + '...'}
          </Typography>
        </View>
      </View>
      <Typography size="sml">{momentDate}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomWidth: 1,
  },
  historyItemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  iconAndLabelWithDid: {
    flexDirection: 'row',
  },
  labelAndDid: {
    justifyContent: 'space-around',
    marginLeft: 12,
  },
});

export default HistoryItem;
