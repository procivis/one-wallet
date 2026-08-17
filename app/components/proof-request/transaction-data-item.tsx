import {
  ImportIcon,
  LinkIcon,
  reportException,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { TransactionDataDisplay } from '@procivis/react-native-one-core';
import React, { FC, useCallback, useMemo } from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import base64 from 'react-native-base64';
import { TemporaryDirectoryPath, writeFile } from 'react-native-fs';
import Share from 'react-native-share';
import { SvgProps } from 'react-native-svg';

import { useExpandableList } from '../../hooks/expandable-list';
import { translate } from '../../i18n';
import SeeMoreButton from './see-more-button';
import TransactionHeader from './transaction-header';

const JSON_DATA_URL_PREFIX = 'data:application/json;base64,';
const PDF_DATA_URL_PREFIX = 'data:application/pdf;base64,';

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
  LoginRiskAction = 'transactionData.loginRiskTransaction.action',
  LoginRiskDateTime = 'transactionData.loginRiskTransaction.dateTime',
  LoginRiskService = 'transactionData.loginRiskTransaction.service',
  LoginRiskTransactionId = 'transactionData.loginRiskTransaction.transactionId',
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
      return translate('transactionData.loginRiskTransaction.transactionId');
    case TransactionDataParameter.LoginRiskAction:
      return translate('transactionData.loginRiskTransaction.action');
    case TransactionDataParameter.LoginRiskService:
      return translate('transactionData.loginRiskTransaction.service');
    case TransactionDataParameter.LoginRiskDateTime:
      return translate('transactionData.loginRiskTransaction.dateTime');
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

const documentFileName = (label: string | undefined): string => {
  const name = label?.replace(/[^\w\-. ]/g, '').trim() || 'document';
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
};

const savePdfDocument = async (
  dataUrl: string,
  fileName: string,
): Promise<void> => {
  const filePath = `${TemporaryDirectoryPath}/${fileName}`;
  await writeFile(
    filePath,
    dataUrl.slice(PDF_DATA_URL_PREFIX.length),
    'base64',
  );
  await Share.open({
    failOnCancel: false,
    filename: fileName,
    type: 'application/pdf',
    url: `file://${filePath}`,
  });
};

export type TransactionDataItemProps = {
  item: TransactionDataDisplay;
};

const TransactionDataItem: FC<TransactionDataItemProps> = ({ item }) => {
  const colorScheme = useAppColorScheme();
  const attributes = item.attributes;
  const {
    expandable,
    expanded,
    forceExpandable,
    toggleExpanded,
    visibleItems,
  } = useExpandableList(attributes);
  const linkHandler = useCallback(
    (url: string) => () => {
      Linking.openURL(url).catch((e) => {
        reportException(e, `Error opening contact link ${url}`);
      });
    },
    [],
  );
  const pdfFileName = useMemo(
    () =>
      documentFileName(
        attributes.find(
          ({ key }) => key === (TransactionDataParameter.Label as string),
        )?.value,
      ),
    [attributes],
  );
  const pdfHandler = useCallback(
    (dataUrl: string, fileName: string) => () => {
      savePdfDocument(dataUrl, fileName).catch((e) => {
        reportException(e, `Error saving document ${fileName}`);
      });
    },
    [],
  );
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
        {visibleItems.map((attribute, index) => {
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
            } else if (value.startsWith(PDF_DATA_URL_PREFIX)) {
              action = {
                icon: ImportIcon,
                onPress: pdfHandler(value, pdfFileName),
              };
              value = pdfFileName;
            } else if (value.startsWith(JSON_DATA_URL_PREFIX)) {
              value = base64.decode(value.slice(JSON_DATA_URL_PREFIX.length));
              itemDefaultNumberOfLines = 5;
              forceExpandable();
            }
          } else if (
            attribute.key ===
              (TransactionDataParameter.SignedProps as string) &&
            !expandable
          ) {
            forceExpandable();
          } else if (
            attribute.key === (TransactionDataParameter.Checksum as string) &&
            !expandable
          ) {
            forceExpandable();
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
          <SeeMoreButton expanded={expanded} onPress={toggleExpanded} />
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
