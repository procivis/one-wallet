import {
  concatTestID,
  CredentialLogo,
  credentialLogoFromCredential,
  Typography,
  UpIcon,
  useAppColorScheme,
  useCoreConfig,
} from '@procivis/one-react-native-components';
import {
  CredentialType,
  PresentationDefinitionTransactionData,
  PresentationDefinitionV2Credential,
} from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import TransactionHeader from './transaction-header';

export type TransactionRequestListItemProps = {
  credential?: PresentationDefinitionV2Credential;
  transaction: PresentationDefinitionTransactionData;
};

const TransactionRequestListItem: FC<TransactionRequestListItemProps> = ({
  credential,
  transaction,
}) => {
  const colorScheme = useAppColorScheme();
  const { data: config } = useCoreConfig();
  const language = useCurrentLanguage();
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
              <UpIcon
                color={colorScheme.text}
                style={[
                  styles.chevron,
                  { backgroundColor: colorScheme.background },
                ]}
              />
            </View>
          }
          logoInitials="QES"
          title={translate('common.signatureRequest')}
        />
      </View>
      <View
        style={[styles.separator, { backgroundColor: colorScheme.accentText }]}
      />
      <View style={styles.row}>
        <Typography
          color={colorScheme.text}
          preset="xs/line-height-small"
          style={styles.authorizedBy}
        >
          {translate('common.authorizedBy')}
        </Typography>
        {credential && config && (
          <CredentialLogo
            size={20}
            {...credentialLogoFromCredential(
              {
                ...credential,
                type: CredentialType.SINGLE,
              },
              config,
              concatTestID('TransactionRequestListItem', transaction.id),
              language,
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  authorizedBy: {
    flex: 1,
    opacity: 0.7,
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

export default TransactionRequestListItem;
