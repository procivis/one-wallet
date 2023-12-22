import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ActivityIndicator,
  concatTestID,
  DetailScreen,
  formatDateTime,
  ListItem,
  RoundButton,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, PropsWithChildren, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CredentialStateEnum } from 'react-native-one-core';

import { MoreIcon } from '../../components/icon/navigation-icon';
import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { RootNavigationProp, RootRouteProp } from '../../navigators/root/root-navigator-routes';
import { formatClaimValue } from '../../utils/credential';

const Section: FunctionComponent<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.section, { backgroundColor: colorScheme.white }]}>
      <Typography accessibilityRole="header" color={colorScheme.text} size="sml" bold={true} caps={true}>
        {title}
      </Typography>
      {children}
    </View>
  );
};

const DataItem: FunctionComponent<{ attribute: string; value: string; testID?: string }> = ({
  attribute,
  value,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View testID={testID} style={[styles.dataItem, { borderColor: colorScheme.background }]}>
      <Typography color={colorScheme.textSecondary} size="sml" style={styles.dataItemLabel}>
        {attribute}
      </Typography>
      <Typography testID={concatTestID(testID, 'value')} color={colorScheme.text}>
        {value}
      </Typography>
    </View>
  );
};

const CredentialDetailScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const route = useRoute<RootRouteProp<'CredentialDetail'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  const { showActionSheetWithOptions } = useActionSheet();
  const onActions = useCallback(
    () =>
      showActionSheetWithOptions(
        {
          options: [translate('credentialDetail.action.delete'), translate('common.close')],
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0,
        },
        (selectedIndex) => {
          if (selectedIndex === 0) {
            Alert.alert(
              translate('credentialDetail.action.delete.confirmation.title'),
              translate('credentialDetail.action.delete.confirmation.message'),
              [
                {
                  text: translate('common.cancel'),
                  isPreferred: true,
                  style: 'cancel',
                },
                {
                  text: translate('common.delete'),
                  style: 'destructive',
                  onPress: () => {
                    navigation.replace('CredentialDeleteProcessing', { credentialId });
                  },
                },
              ],
              { cancelable: true },
            );
          }
        },
      ),
    [navigation, showActionSheetWithOptions, credentialId],
  );

  if (!credential) {
    return <ActivityIndicator />;
  }

  return (
    <DetailScreen
      testID="CredentialDetailScreen"
      onBack={navigation.goBack}
      title={credential.schema.name}
      style={{ backgroundColor: colorScheme.background }}
      rightButton={
        <RoundButton accessibilityLabel={translate('credentialDetail.actions')} icon={MoreIcon} onPress={onActions} />
      }>
      <Section title={translate('credentialDetail.credential.title')}>
        <DataItem attribute={translate('credentialDetail.credential.schema')} value={credential.schema.name} />
        <DataItem attribute={translate('credentialDetail.credential.issuer')} value={credential.issuerDid ?? ''} />
        <DataItem attribute={translate('credentialDetail.credential.format')} value={credential.schema.format} />
        <DataItem
          attribute={translate('credentialDetail.credential.revocationMethod')}
          value={credential.schema.revocationMethod}
        />
        {credential.state === CredentialStateEnum.REVOKED ? (
          <DataItem
            testID="CredentialDetailScreen.status"
            attribute={translate('credentialDetail.credential.status')}
            value={translate('credentialDetail.log.revoke')}
          />
        ) : null}
      </Section>
      <Section title={translate('credentialDetail.attributes.title')}>
        {credential.claims.map((attribute) => (
          <DataItem key={attribute.key} attribute={attribute.key} value={formatClaimValue(attribute)} />
        ))}
      </Section>
      <Section title={translate('credentialDetail.log.title')}>
        <View style={styles.logTitlePadding} />
        {credential.revocationDate ? (
          <ListItem
            testID="CredentialDetailScreen.log.revoked"
            title={translate('credentialDetail.log.revoke')}
            subtitle={formatDateTime(new Date(credential.revocationDate))}
            style={styles.logItem}
            rightAccessory={null}
          />
        ) : null}
        <ListItem
          testID="CredentialDetailScreen.log.issued"
          title={translate('credentialDetail.log.issue')}
          subtitle={formatDateTime(new Date(credential.issuanceDate))}
          style={styles.logItem}
          rightAccessory={null}
        />
      </Section>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    borderBottomWidth: 1,
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  logItem: {
    paddingHorizontal: 0,
  },
  logTitlePadding: {
    marginBottom: 12,
  },
  section: {
    borderRadius: 20,
    marginBottom: 12,
    padding: 24,
    paddingTop: 12,
  },
});

export default CredentialDetailScreen;
