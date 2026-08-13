import {
  Typography,
  UpIcon,
  useAppColorScheme,
  useTransactionData,
} from '@procivis/one-react-native-components';
import {
  PresentationDefinitionTransactionData,
  PresentationDefinitionV2Credential,
} from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import {
  formatPaymentAmount,
  parsePaymentTransactionData,
} from '../../utils/payment-transaction';
import PaymentRecurringBadge from './payment-recurring-badge';
import TransactionAuthorizedBy from './transaction-authorized-by';
import TransactionHeader from './transaction-header';

export type PaymentRequestListItemProps = {
  credential?: PresentationDefinitionV2Credential;
  proofId: string;
  transaction: PresentationDefinitionTransactionData;
};

const PaymentRequestListItem: FC<PaymentRequestListItemProps> = ({
  credential,
  proofId,
  transaction,
}) => {
  const colorScheme = useAppColorScheme();
  const { data: transactionData } = useTransactionData(proofId, transaction.id);

  const payment = parsePaymentTransactionData(transactionData);
  const amount = formatPaymentAmount(payment?.amount, payment?.currency);

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.white }]}>
      <View style={styles.row}>
        <TransactionHeader
          accessory={
            <View
              style={[
                styles.chevronWrapper,
                { backgroundColor: colorScheme.background },
              ]}
            >
              <UpIcon color={colorScheme.text} style={styles.chevron} />
            </View>
          }
          logoInitials="SCA"
          title={
            transactionData?.transactionDataDisplay[0].title ??
            translate('common.paymentConfirmation')
          }
        />
      </View>
      <View
        style={[styles.separator, { backgroundColor: colorScheme.accentText }]}
      />
      <View style={styles.amountWrapper}>
        {amount && (
          <Typography color={colorScheme.text} preset="xl">
            {amount}
          </Typography>
        )}
        {payment?.recurring && <PaymentRecurringBadge />}
      </View>
      <View
        style={[styles.separator, { backgroundColor: colorScheme.accentText }]}
      />
      <TransactionAuthorizedBy
        credential={credential}
        transaction={transaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  amountWrapper: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  chevron: {
    marginLeft: 2,
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
  chevronWrapper: {
    alignItems: 'center',
    borderRadius: 19,
    display: 'flex',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  container: {
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  separator: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
});

export default PaymentRequestListItem;
