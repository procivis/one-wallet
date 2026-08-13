import {
  UpIcon,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  PresentationDefinitionTransactionData,
  PresentationDefinitionV2Credential,
} from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { PAYMENT_SCA_TRANSACTION_TYPE } from '../../utils/payment-transaction';
import PaymentRequestListItem from './payment-request-list-item';
import TransactionAuthorizedBy from './transaction-authorized-by';
import TransactionHeader from './transaction-header';

type TransactionHeaderConfig = {
  logoInitials: string;
  titleKey: string;
};

export const TRANSACTION_HEADER_CONFIG: Record<
  string,
  TransactionHeaderConfig
> = {
  QES_APPROVAL: {
    logoInitials: 'QES',
    titleKey: translate('common.signatureRequest'),
  },
  SCA_ACCOUNT_ACCESS: {
    logoInitials: 'SCA',
    titleKey: translate('common.accountAccess'),
  },
  SCA_EMANDATE: {
    logoInitials: 'SCA',
    titleKey: translate('common.eMandate'),
  },
  SCA_LOGIN_RISK_TRANSACTION: {
    logoInitials: 'SCA',
    titleKey: translate('common.loginRiskTransaction'),
  },
  SCA_PAYMENT_CONFIRMATION: {
    logoInitials: 'SCA',
    titleKey: translate('common.paymentConfirmation'),
  },
};

export const DEFAULT_TRANSACTION_HEADER =
  TRANSACTION_HEADER_CONFIG.QES_APPROVAL;

export type TransactionRequestListItemProps = {
  credential?: PresentationDefinitionV2Credential;
  proofId: string;
  transaction: PresentationDefinitionTransactionData;
};

const TransactionRequestListItem: FC<TransactionRequestListItemProps> = ({
  credential,
  proofId,
  transaction,
}) => {
  const colorScheme = useAppColorScheme();

  if (transaction.type === PAYMENT_SCA_TRANSACTION_TYPE) {
    return (
      <PaymentRequestListItem
        credential={credential}
        proofId={proofId}
        transaction={transaction}
      />
    );
  }

  const header =
    TRANSACTION_HEADER_CONFIG[transaction.type] ?? DEFAULT_TRANSACTION_HEADER;

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
          logoInitials={header.logoInitials}
          title={header.titleKey}
        />
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

export default TransactionRequestListItem;
