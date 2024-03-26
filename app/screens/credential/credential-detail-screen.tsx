import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ActivityIndicator,
  DetailScreen,
  formatDateTime,
  ListItem,
  RoundButton,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { DataItem } from '../../components/common/data-item';
import { Section } from '../../components/common/section';
import { Claim } from '../../components/credential/claim';
import { MoreIcon } from '../../components/icon/navigation-icon';
import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { getValidityState, ValidityState } from '../../utils/credential';

const CredentialDetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'Detail'>>();
  const route = useRoute<CredentialDetailRouteProp<'Detail'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  const validityState = getValidityState(credential);

  const validityStateValue = useMemo(() => {
    if (
      validityState === ValidityState.Suspended &&
      credential?.suspendEndDate
    ) {
      return translate(`credentialDetail.validity.suspendedUntil`, {
        date: formatDateTime(new Date(credential.suspendEndDate)),
      });
    }

    return translate(`credentialDetail.validity.${validityState}`);
  }, [credential?.suspendEndDate, validityState]);

  const validityStateValueColor = useMemo(
    () =>
      [ValidityState.Revoked, ValidityState.Suspended].includes(validityState)
        ? colorScheme.alertText
        : colorScheme.text,
    [colorScheme.alertText, colorScheme.text, validityState],
  );

  const isRevokable = useMemo(
    () =>
      credential?.schema.revocationMethod !== 'NONE' &&
      (validityState === ValidityState.Valid ||
        validityState === ValidityState.Suspended),
    [credential?.schema.revocationMethod, validityState],
  );

  const { showActionSheetWithOptions } = useActionSheet();

  const options = useMemo(() => {
    const commonOptions = [
      translate('credentialDetail.action.delete'),
      translate('common.close'),
    ];

    if (isRevokable) {
      return {
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1,
        options: [
          translate('credentialDetail.action.checkValidity'),
          ...commonOptions,
        ],
      };
    }

    return {
      cancelButtonIndex: 1,
      destructiveButtonIndex: 0,
      options: commonOptions,
    };
  }, [isRevokable]);

  const handleCheckValidity = useCallback(() => {
    navigation.replace('ValidityProcessing', {
      credentialId,
    });
  }, [credentialId, navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      translate('credentialDetail.action.delete.confirmation.title'),
      translate('credentialDetail.action.delete.confirmation.message'),
      [
        {
          isPreferred: true,
          style: 'cancel',
          text: translate('common.cancel'),
        },
        {
          onPress: () => {
            navigation.replace('DeleteProcessing', {
              credentialId,
            });
          },
          style: 'destructive',
          text: translate('common.delete'),
        },
      ],
      { cancelable: true },
    );
  }, [credentialId, navigation]);

  const onActions = useCallback(
    () =>
      showActionSheetWithOptions(options, (selectedIndex) => {
        if (isRevokable) {
          switch (selectedIndex) {
            case 0:
              handleCheckValidity();
              return;
            case 1:
              handleDelete();
              return;
            default:
              return;
          }
        }
        switch (selectedIndex) {
          case 0:
            handleDelete();
            return;
          default:
            return;
        }
      }),
    [
      handleCheckValidity,
      handleDelete,
      isRevokable,
      options,
      showActionSheetWithOptions,
    ],
  );

  if (!credential) {
    return <ActivityIndicator />;
  }

  return (
    <DetailScreen
      onBack={() => rootNavigation.navigate('Dashboard', { screen: 'Wallet' })}
      rightButton={
        <RoundButton
          accessibilityLabel={translate('credentialDetail.actions')}
          icon={MoreIcon}
          onPress={onActions}
          testID="CredentialDetailScreen.header.action"
        />
      }
      style={{ backgroundColor: colorScheme.background }}
      testID="CredentialDetailScreen"
      title={credential.schema.name}
    >
      <Section title={translate('credentialDetail.credential.title')}>
        <DataItem
          attribute={translate('credentialDetail.credential.schema')}
          value={credential.schema.name}
        />
        <DataItem
          attribute={translate('credentialDetail.credential.issuer')}
          value={credential.issuerDid ?? ''}
        />
        <DataItem
          attribute={translate('credentialDetail.credential.format')}
          value={credential.schema.format}
        />
        <DataItem
          attribute={translate('credentialDetail.credential.revocationMethod')}
          value={credential.schema.revocationMethod}
        />
        <DataItem
          attribute={translate('credentialDetail.credential.status')}
          testID="CredentialDetailScreen.status"
          value={validityStateValue}
          valueColor={validityStateValueColor}
        />
      </Section>
      <Section title={translate('credentialDetail.attributes.title')}>
        {credential.claims.map((claim, index, { length }) => (
          <Claim
            claim={claim}
            key={claim.key}
            last={length === index + 1}
            style={{ borderColor: colorScheme.background }}
            testID={`CredentialDetailScreen.claim.${claim.key}`}
          />
        ))}
      </Section>
      <Section title={translate('credentialDetail.log.title')}>
        <View style={styles.logTitlePadding} />
        {credential.lvvcIssuanceDate && (
          <ListItem
            rightAccessory={null}
            style={styles.logItem}
            subtitle={formatDateTime(new Date(credential.lvvcIssuanceDate))}
            testID="CredentialDetailScreen.log.validityUpdated"
            title={translate('credentialDetail.log.validityUpdated')}
          />
        )}
        {validityState === ValidityState.Suspended && (
          <ListItem
            rightAccessory={null}
            style={styles.logItem}
            subtitle={formatDateTime(new Date(credential.lastModified))}
            testID="CredentialDetailScreen.log.suspended"
            title={translate('credentialDetail.log.suspended')}
          />
        )}
        {credential.revocationDate && (
          <ListItem
            rightAccessory={null}
            style={styles.logItem}
            subtitle={formatDateTime(new Date(credential.revocationDate))}
            testID="CredentialDetailScreen.log.revoked"
            title={translate('credentialDetail.log.revoked')}
          />
        )}
        <ListItem
          rightAccessory={null}
          style={styles.logItem}
          subtitle={formatDateTime(new Date(credential.issuanceDate))}
          testID="CredentialDetailScreen.log.issued"
          title={translate('credentialDetail.log.issued')}
        />
      </Section>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  logItem: {
    paddingHorizontal: 0,
  },
  logTitlePadding: {
    marginBottom: 12,
  },
});

export default CredentialDetailScreen;
