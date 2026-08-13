import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

const RECURRING_LABEL = 'Recurring';

const PaymentRecurringBadge: FC = () => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.recurring}>
      <View
        style={[styles.recurringDot, { backgroundColor: colorScheme.success }]}
      />
      <Typography
        color={colorScheme.text}
        preset="xs/line-height-small"
        style={styles.recurringLabel}
      >
        {RECURRING_LABEL}
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
  recurringDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  recurringLabel: {
    opacity: 0.7,
  },
});

export default PaymentRecurringBadge;
