import { ProofTransactionData } from '@procivis/react-native-one-core';
import moment from 'moment';

import { translate } from '../i18n';

export const PAYMENT_SCA_TRANSACTION_TYPE = 'SCA_PAYMENT_CONFIRMATION';

const PAYMENT_ATTRIBUTE_KEY = {
  amount: 'transactionData.paymentConfirmation.amount',
  currency: 'transactionData.paymentConfirmation.currency',
  executionDate: 'transactionData.paymentConfirmation.executionDate',
  payeeId: 'transactionData.paymentConfirmation.payee.id',
  payeeName: 'transactionData.paymentConfirmation.payee.name',
  recurrenceFrequency:
    'transactionData.paymentConfirmation.recurrence.frequency',
  recurrenceStartDate:
    'transactionData.paymentConfirmation.recurrence.startDate',
  transactionId: 'transactionData.paymentConfirmation.transactionId',
  website: 'transactionData.paymentConfirmation.payee.website',
} as const;

const RECURRENCE_KEY_PREFIX = 'transactionData.paymentConfirmation.recurrence.';

export interface PaymentTransactionData {
  amount?: string;
  currency?: string;
  executionDate?: string;
  payeeId?: string;
  payeeName?: string;
  recurrenceFrequency?: string;
  recurrenceStartDate?: string;
  recurring: boolean;
  transactionId?: string;
  website?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  CHF: 'CHF',
  EUR: '€',
  GBP: '£',
  USD: '$',
};

export const parsePaymentTransactionData = (
  transactionData: ProofTransactionData | undefined,
): PaymentTransactionData | undefined => {
  if (!transactionData) {
    return undefined;
  }

  const transactionDataDisplay = transactionData.transactionDataDisplay[0];

  const attributes = new Map<string, string>();
  transactionDataDisplay.attributes.forEach(({ key, value }) => {
    attributes.set(key, value);
  });

  const recurring = Array.from(attributes).some(
    ([key, value]) => key.startsWith(RECURRENCE_KEY_PREFIX) && Boolean(value),
  );

  return {
    amount: attributes.get(PAYMENT_ATTRIBUTE_KEY.amount),
    currency: attributes.get(PAYMENT_ATTRIBUTE_KEY.currency),
    executionDate: attributes.get(PAYMENT_ATTRIBUTE_KEY.executionDate),
    payeeId: attributes.get(PAYMENT_ATTRIBUTE_KEY.payeeId),
    payeeName: attributes.get(PAYMENT_ATTRIBUTE_KEY.payeeName),
    recurrenceFrequency: attributes.get(
      PAYMENT_ATTRIBUTE_KEY.recurrenceFrequency,
    ),
    recurrenceStartDate: attributes.get(
      PAYMENT_ATTRIBUTE_KEY.recurrenceStartDate,
    ),
    recurring,
    transactionId: attributes.get(PAYMENT_ATTRIBUTE_KEY.transactionId),
    website: attributes.get(PAYMENT_ATTRIBUTE_KEY.website),
  };
};

export const formatPaymentAmount = (
  amount: string | undefined,
  currency: string | undefined,
): string | undefined => {
  if (!amount) {
    return undefined;
  }
  const numeric = Number(amount);
  const formattedAmount = Number.isNaN(numeric) ? amount : numeric.toFixed(2);
  if (!currency) {
    return formattedAmount;
  }
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
  return `${symbol} ${formattedAmount}`;
};

export const formatPaymentFrequency = (
  value: string | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }
  switch (value.toUpperCase()) {
    case 'ADHO':
      return translate('paymentFrequency.adHoc');
    case 'DAIL':
      return translate('paymentFrequency.daily');
    case 'FRTN':
      return translate('paymentFrequency.fortnightly');
    case 'INDA':
      return translate('paymentFrequency.intraDay');
    case 'MIAN':
      return translate('paymentFrequency.semiAnnual');
    case 'MNTH':
      return translate('paymentFrequency.monthly');
    case 'QURT':
      return translate('paymentFrequency.quarterly');
    case 'WEEK':
      return translate('paymentFrequency.weekly');
    case 'YEAR':
      return translate('paymentFrequency.annual');
    default:
      return value;
  }
};

export const formatPaymentDate = (
  value: string | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY, HH:mm') : value;
};

export const formatPaymentDateOnly = (
  value: string | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('DD.MM.YYYY') : value;
};
