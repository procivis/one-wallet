import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { RefreshIcon } from '../icon/refresh-icon';

const PaymentRecurringBadge: FC = () => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.recurring}>
      <View
        style={[styles.recurringIcon, { backgroundColor: colorScheme.success }]}
      >
        <RefreshIcon
          color={colorScheme.white}
          height={11}
          style={styles.recurringIconGlyph}
          width={11}
        />
      </View>
      <Typography
        color={colorScheme.text}
        preset="s/line-height-capped"
        style={styles.recurringLabel}
      >
        {translate('common.recurring')}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  recurring: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  recurringIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  recurringIconGlyph: {
    transform: [{ scaleX: -1 }],
  },
  recurringLabel: {
    opacity: 0.7,
  },
});

export default PaymentRecurringBadge;
