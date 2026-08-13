import {
  LinkIcon,
  reportException,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { TransactionDataDisplay } from '@procivis/react-native-one-core';
import React, { FC, useCallback, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import base64 from 'react-native-base64';
import { SvgProps } from 'react-native-svg';

import { translate } from '../../i18n';
import TransactionHeader from './transaction-header';

type ListItemProps = {
  action?: {
    icon: FC<SvgProps>;
    onPress: () => void;
  };
  dark?: boolean;
  numberOfLines: number;
  title: string;
  value: string | ImageSourcePropType;
};

const ListItem: FC<ListItemProps> = ({
  action,
  dark,
  numberOfLines,
  title,
  value,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.item,
        { backgroundColor: dark ? undefined : colorScheme.white },
      ]}
    >
      <View style={styles.itemLabels}>
        <Typography
          color={colorScheme.text}
          numberOfLines={1}
          preset="s/line-height-capped"
          style={styles.itemTitleLabel}
        >
          {title}
        </Typography>
        {typeof value === 'string' ? (
          <Typography
            color={colorScheme.text}
            numberOfLines={numberOfLines}
            preset="s/line-height-capped"
          >
            {value}
          </Typography>
        ) : (
          <Image source={value} />
        )}
      </View>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[
            styles.actionButton,
            {
              backgroundColor: dark ? colorScheme.white : colorScheme.grayDark,
            },
          ]}
        >
          <action.icon color={colorScheme.black} />
        </TouchableOpacity>
      )}
    </View>
  );
};

enum TransactionDataParameter {
  AccountAccessDescription = 'transactionData.accountAccess.description',
  AccountAccessTransactionId = 'transactionData.accountAccess.transactionId',
  Checksum = 'transactionData.qesApproval.documentInfo.checksum',
  ConformanceLevel = 'transactionData.qesApproval.documentInfo.conformance_level',
  EMandateCreditorId = 'transactionData.eMandate.creditorId',
  EMandateDateTime = 'transactionData.eMandate.dateTime',
  EMandateEndDate = 'transactionData.eMandate.endDate',
  EMandatePurpose = 'transactionData.eMandate.purpose',
  EMandateReferenceNumber = 'transactionData.eMandate.referenceNumber',
  EMandateStartDate = 'transactionData.eMandate.startDate',
  EMandateTransactionId = 'transactionData.eMandate.transactionId',
  Label = 'transactionData.qesApproval.documentInfo.label',
  Link = 'transactionData.qesApproval.documentInfo.href',
  LoginRiskAction = 'transactionData.loginRiskTransacrtion.action',
  LoginRiskDateTime = 'transactionData.loginRiskTransacrtion.dateTime',
  LoginRiskService = 'transactionData.loginRiskTransacrtion.service',
  LoginRiskTransactionId = 'transactionData.loginRiskTransacrtion.transactionId',
  OneTimePassword = 'transactionData.qesApproval.documentInfo.access.oneTimePassword',
  SignatureFormat = 'transactionData.qesApproval.documentInfo.signature_format',
  SignedProps = 'transactionData.qesApproval.documentInfo.signed_props',
}

const transactionDataParameterTitle = (
  key: TransactionDataParameter,
): string => {
  switch (key) {
    case TransactionDataParameter.OneTimePassword:
      return translate(
        'transactionData.qesApproval.documentInfo.access.oneTimePassword',
      );
    case TransactionDataParameter.Checksum:
      return translate('transactionData.qesApproval.documentInfo.checksum');
    case TransactionDataParameter.ConformanceLevel:
      return translate(
        'transactionData.qesApproval.documentInfo.conformance_level',
      );
    case TransactionDataParameter.Label:
      return translate('transactionData.qesApproval.documentInfo.label');
    case TransactionDataParameter.Link:
      return translate('transactionData.qesApproval.documentInfo.href');
    case TransactionDataParameter.SignatureFormat:
      return translate(
        'transactionData.qesApproval.documentInfo.signature_format',
      );
    case TransactionDataParameter.SignedProps:
      return translate('transactionData.qesApproval.documentInfo.signed_props');
    case TransactionDataParameter.LoginRiskTransactionId:
      return translate('transactionData.loginRiskTransacrtion.transactionId');
    case TransactionDataParameter.LoginRiskAction:
      return translate('transactionData.loginRiskTransacrtion.action');
    case TransactionDataParameter.LoginRiskService:
      return translate('transactionData.loginRiskTransacrtion.service');
    case TransactionDataParameter.LoginRiskDateTime:
      return translate('transactionData.loginRiskTransacrtion.dateTime');
    case TransactionDataParameter.AccountAccessTransactionId:
      return translate('transactionData.accountAccess.transactionId');
    case TransactionDataParameter.AccountAccessDescription:
      return translate('transactionData.accountAccess.description');
    case TransactionDataParameter.EMandateTransactionId:
      return translate('transactionData.eMandate.transactionId');
    case TransactionDataParameter.EMandatePurpose:
      return translate('transactionData.eMandate.purpose');
    case TransactionDataParameter.EMandateCreditorId:
      return translate('transactionData.eMandate.creditorId');
    case TransactionDataParameter.EMandateReferenceNumber:
      return translate('transactionData.eMandate.referenceNumber');
    case TransactionDataParameter.EMandateDateTime:
      return translate('transactionData.eMandate.dateTime');
    case TransactionDataParameter.EMandateStartDate:
      return translate('transactionData.eMandate.startDate');
    case TransactionDataParameter.EMandateEndDate:
      return translate('transactionData.eMandate.endDate');

    default:
      return key;
  }
};

export type TransactionDataItemProps = {
  item: TransactionDataDisplay;
};

const TransactionDataItem: FC<TransactionDataItemProps> = ({ item }) => {
  const colorScheme = useAppColorScheme();
  const [expanded, setExpanded] = useState(false);
  const attributes = item.attributes;
  const [expandable, setExpandable] = useState(attributes.length > 3);
  const linkHandler = useCallback(
    (url: string) => () => {
      Linking.openURL(url).catch((e) => {
        reportException(e, `Error opening contact link ${url}`);
      });
    },
    [],
  );
  const toggleExpanded = useCallback(() => {
    setExpanded((previousValue) => !previousValue);
  }, []);
  const collapsedLength = attributes.length <= 3 ? attributes.length : 2;
  return (
    <View style={[styles.container, { backgroundColor: colorScheme.white }]}>
      {item.title && (
        <View style={styles.row}>
          <TransactionHeader
            logoInitials={item.title?.replaceAll(/[^A-Z]/g, '') ?? ''}
            title={item.title ?? ''}
          />
        </View>
      )}
      <View>
        {attributes
          .slice(
            0,
            expanded || !expandable ? attributes.length : collapsedLength,
          )
          .map((attribute, index) => {
            const title = transactionDataParameterTitle(
              attribute.key as TransactionDataParameter,
            );
            let value = attribute.value.replace(/^"(.+)"$/, '$1');
            let action: ListItemProps['action'] | undefined = undefined;
            let itemDefaultNumberOfLines = 1;
            if (attribute.key === (TransactionDataParameter.Link as string)) {
              if (value.startsWith('http://') || value.startsWith('https://')) {
                action = {
                  icon: LinkIcon,
                  onPress: linkHandler(value),
                };
              } else if (value.startsWith('data:application/json;base64,')) {
                value = base64.decode(
                  value.replace('data:application/json;base64,', ''),
                );
                itemDefaultNumberOfLines = 5;
                setExpandable(true);
              }
            } else if (
              attribute.key ===
                (TransactionDataParameter.SignedProps as string) &&
              !expandable
            ) {
              setExpandable(true);
            } else if (
              attribute.key === (TransactionDataParameter.Checksum as string) &&
              !expandable
            ) {
              setExpandable(true);
            }
            return (
              <View key={index}>
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: colorScheme.accentText },
                  ]}
                />
                <ListItem
                  action={action}
                  numberOfLines={expanded ? 0 : itemDefaultNumberOfLines}
                  title={title}
                  value={value}
                />
              </View>
            );
          })}
        {expandable && (
          <View>
            <View
              style={[
                styles.separator,
                { backgroundColor: colorScheme.accentText },
              ]}
            />
            <TouchableOpacity
              onPress={toggleExpanded}
              style={styles.expandButton}
            >
              <Typography align="center" color={colorScheme.text}>
                {expanded
                  ? translate('common.seeLess')
                  : translate('common.seeMore')}
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  container: {
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  expandButton: {
    paddingBottom: 10,
    paddingTop: 16,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    width: '100%',
  },
  itemLabels: {
    flex: 1,
    flexDirection: 'column',
  },
  itemTitleLabel: {
    opacity: 0.5,
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

export default TransactionDataItem;
