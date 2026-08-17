import {
  LinkIcon,
  reportException,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { ProofTransactionData } from '@procivis/react-native-one-core';
import React, { FC, useCallback, useMemo } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { useExpandableList } from '../../hooks/expandable-list';
import { translate } from '../../i18n';
import {
  formatPaymentAmount,
  formatPaymentDate,
  formatPaymentDateOnly,
  formatPaymentFrequency,
  parsePaymentTransactionData,
} from '../../utils/payment-transaction';
import PaymentRecurringBadge from './payment-recurring-badge';
import SeeMoreButton from './see-more-button';

const initialsFromName = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

type DetailRowProps = {
  title: string;
  value: string;
};

const DetailRow: FC<DetailRowProps> = ({ title, value }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.detailRow}>
      <View
        style={[styles.separator, { backgroundColor: colorScheme.accentText }]}
      />
      <View style={styles.detailLabels}>
        <Typography
          color={colorScheme.text}
          preset="s/line-height-capped"
          style={styles.detailTitle}
        >
          {title}
        </Typography>
        <Typography color={colorScheme.text} preset="s/line-height-capped">
          {value}
        </Typography>
      </View>
    </View>
  );
};

export type PaymentTransactionDetailsProps = {
  transactionData: ProofTransactionData | undefined;
};

const PaymentTransactionDetails: FC<PaymentTransactionDetailsProps> = ({
  transactionData,
}) => {
  const colorScheme = useAppColorScheme();
  const payment = parsePaymentTransactionData(transactionData);

  const amount = formatPaymentAmount(payment?.amount, payment?.currency);
  const date = formatPaymentDate(payment?.executionDate);
  const frequency = formatPaymentFrequency(payment?.recurrenceFrequency);
  const startDate = formatPaymentDateOnly(payment?.recurrenceStartDate);
  const website = payment?.website;
  const transactionId = payment?.transactionId;

  const detailRows = useMemo(() => {
    const rows: DetailRowProps[] = [];
    if (transactionId) {
      rows.push({
        title: translate('common.transactionId'),
        value: transactionId,
      });
    }
    if (date) {
      rows.push({ title: translate('common.dateAndTime'), value: date });
    }
    if (startDate) {
      rows.push({ title: translate('common.startDate'), value: startDate });
    }
    if (frequency) {
      rows.push({ title: translate('common.frequency'), value: frequency });
    }
    return rows;
  }, [date, frequency, startDate, transactionId]);

  const {
    expandable,
    expanded,
    toggleExpanded,
    visibleItems: visibleRows,
  } = useExpandableList(detailRows, { maxItemsWithoutExpand: 2 });

  const onOpenWebsite = useCallback(() => {
    if (!website) {
      return;
    }
    Linking.openURL(website).catch((e) => {
      reportException(e, `Error opening payment website ${website}`);
    });
  }, [website]);

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.white }]}>
      <View style={styles.amountWrapper}>
        {amount && (
          <Typography
            color={colorScheme.text}
            preset="xl"
            style={styles.amount}
          >
            {amount}
          </Typography>
        )}
        {payment?.recurring && <PaymentRecurringBadge />}
      </View>
      {payment?.payeeName && (
        <View style={styles.payeeRow}>
          <View style={[styles.avatar, { backgroundColor: colorScheme.text }]}>
            <Typography color={colorScheme.white} preset="s/line-height-capped">
              {initialsFromName(payment.payeeName)}
            </Typography>
          </View>
          <View style={styles.payeeLabels}>
            <Typography color={colorScheme.text} preset="m">
              {payment.payeeName}
            </Typography>
            {payment.payeeId && (
              <Typography
                color={colorScheme.text}
                preset="xs/line-height-small"
                style={styles.payeeId}
              >
                {payment.payeeId}
              </Typography>
            )}
          </View>
          {website && (
            <TouchableOpacity
              onPress={onOpenWebsite}
              style={[
                styles.actionButton,
                { backgroundColor: colorScheme.grayDark },
              ]}
            >
              <LinkIcon color={colorScheme.black} />
            </TouchableOpacity>
          )}
        </View>
      )}
      {visibleRows.map((row) => (
        <DetailRow key={row.title} title={row.title} value={row.value} />
      ))}
      {expandable && (
        <SeeMoreButton expanded={expanded} onPress={toggleExpanded} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  amount: {
    fontSize: 34,
    lineHeight: 42,
  },
  amountWrapper: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  detailLabels: {
    flexDirection: 'column',
  },
  detailRow: {
    gap: 8,
  },
  detailTitle: {
    opacity: 0.5,
  },
  payeeId: {
    opacity: 0.5,
  },
  payeeLabels: {
    flex: 1,
    flexDirection: 'column',
  },
  payeeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  separator: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
});

export default PaymentTransactionDetails;
