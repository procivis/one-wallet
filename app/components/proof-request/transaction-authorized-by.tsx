import {
  concatTestID,
  CredentialLogo,
  credentialLogoFromCredential,
  CredentialWarningIcon,
  Typography,
  useAppColorScheme,
  useCoreConfig,
} from '@procivis/one-react-native-components';
import {
  CredentialType,
  PresentationDefinitionTransactionData,
  PresentationDefinitionV2Credential,
} from '@procivis/react-native-one-core';
import React, { FC } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';

export type TransactionAuthorizedByProps = {
  credential?: PresentationDefinitionV2Credential;
  transaction: PresentationDefinitionTransactionData;
};

const TransactionAuthorizedBy: FC<TransactionAuthorizedByProps> = ({
  credential,
  transaction,
}) => {
  const colorScheme = useAppColorScheme();
  const { data: config } = useCoreConfig();
  const language = useCurrentLanguage();
  const iconBackgroundStyle: ViewStyle = {
    backgroundColor: colorScheme.background,
    borderColor: colorScheme.background,
  };
  return (
    <View style={styles.row}>
      <Typography
        color={colorScheme.text}
        preset="xs/line-height-small"
        style={styles.authorizedBy}
      >
        {translate('common.authorizedBy')}
      </Typography>
      {credential && config && (
        <View style={[styles.icon, iconBackgroundStyle]}>
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
        </View>
      )}
      {!credential && (
        <View style={[styles.missingIcon, iconBackgroundStyle]}>
          <CredentialWarningIcon />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  authorizedBy: {
    flex: 1,
    opacity: 0.7,
  },
  icon: {
    borderRadius: 6,
    padding: 4,
  },
  missingIcon: {
    borderRadius: 6,
    padding: 2,
  },
  row: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
});

export default TransactionAuthorizedBy;
