import {
  Accordion,
  Button,
  formatDateTime,
  Selector,
  SelectorStatus,
  SharingScreen,
  SharingScreenVariation,
  TextAvatar,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';

const DataItem: FunctionComponent<{
  attribute: string;
  value: string | undefined;
  last?: boolean;
  status?: SelectorStatus;
  onPress?: () => void;
}> = ({ attribute, value, last, status, onPress }) => {
  const colorScheme = useAppColorScheme();
  const selector = status || !value ? <Selector status={status ?? SelectorStatus.LockedInvalid} /> : null;
  return (
    <View style={[styles.dataItem, last && styles.dataItemLast, { borderColor: colorScheme.lighterGrey }]}>
      <View style={styles.dataItemLeft}>
        <Typography color={colorScheme.textSecondary} size="sml" style={styles.dataItemLabel}>
          {attribute}
        </Typography>
        <Typography color={value ? colorScheme.text : colorScheme.alertText}>
          {value ?? translate('proofRequest.missingAttribute')}
        </Typography>
      </View>
      {selector && onPress ? (
        <TouchableOpacity accessibilityRole="button" onPress={onPress}>
          {selector}
        </TouchableOpacity>
      ) : (
        selector
      )}
    </View>
  );
};

const ProofRequestScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp<'IssueCredential'>>();
  const sharingNavigation = useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();

  useBlockOSBackNavigation();

  const { request, selectedCredentialId } = route.params;
  const {
    walletStore: { credentials },
  } = useStores();

  const potentialCredentials = useMemo(
    () => credentials.filter(({ schema }) => schema === request.credentialSchema),
    [credentials, request],
  );

  const [credentialId, setCredentialId] = useState<string | undefined>(
    // pick first matching credential
    () => potentialCredentials?.[0]?.id,
  );

  const credential = useMemo(() => credentials.find(({ id }) => id === credentialId), [credentialId, credentials]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(() =>
    request.attributes.map(({ key }) => key),
  );

  const onReject = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  const onConfirm = useCallback(() => {
    if (credentialId) {
      sharingNavigation.navigate('Processing', { request, credentialId });
    }
  }, [credentialId, request, sharingNavigation]);

  const onSelect = useCallback(() => {
    if (credentialId) {
      sharingNavigation.navigate('SelectCredential', { selectedCredentialId: credentialId, request });
    }
  }, [credentialId, request, sharingNavigation]);
  // result of selection is propagated using the navigation param `selectedCredentialId`
  useEffect(() => {
    if (selectedCredentialId) {
      setCredentialId(selectedCredentialId);
    }
  }, [selectedCredentialId]);

  return (
    <SharingScreen
      variation={SharingScreenVariation.Neutral}
      title={translate('proofRequest.title')}
      contentTitle={translate('proofRequest.attributes')}
      cancelLabel={translate('common.cancel')}
      onCancel={onReject}
      submitLabel={translate('proofRequest.confirm')}
      onSubmit={credentialId && selectedAttributes.length ? onConfirm : undefined}
      header={
        <>
          <View style={styles.header}>
            <Typography size="sml" bold={true} caps={true} style={styles.headerLabel} accessibilityRole="header">
              {translate('proofRequest.verifier')}
            </Typography>
            <Typography color={colorScheme.text}>{request.verifier}</Typography>
          </View>
          <View style={[styles.dataWrapper, { backgroundColor: colorScheme.background }]}>
            <DataItem attribute={translate('credentialDetail.credential.format')} value={request.credentialFormat} />
            <DataItem
              attribute={translate('credentialDetail.credential.revocationMethod')}
              value={request.revocationMethod}
            />
            <DataItem
              attribute={translate('credentialDetail.credential.transport')}
              value={request.transport}
              last={true}
            />
          </View>
        </>
      }>
      <Accordion
        title={request.credentialSchema}
        subtitle={
          credential?.issuedOn ? formatDateTime(credential.issuedOn) : translate('proofRequest.missingCredential.title')
        }
        subtitleStyle={credential ? undefined : { color: colorScheme.alertText }}
        icon={{ component: <TextAvatar produceInitials={true} text={request.credentialSchema} innerSize={48} /> }}>
        {request.attributes.map((attribute, index, { length }) => {
          const status = (() => {
            if (!credential) return SelectorStatus.LockedInvalid;
            if (attribute.mandatory) return SelectorStatus.LockedSelected;
            return selectedAttributes.includes(attribute.key)
              ? SelectorStatus.SelectedCheck
              : SelectorStatus.Unselected;
          })();
          return (
            <DataItem
              key={attribute.key}
              attribute={attribute.key}
              value={credential?.attributes.find(({ key }) => key === attribute.key)?.value}
              last={length === index + 1}
              status={status}
              onPress={
                !attribute.mandatory && credential
                  ? () =>
                      setSelectedAttributes((prev) => {
                        return prev.includes(attribute.key)
                          ? prev.filter((key) => attribute.key !== key)
                          : [...prev, attribute.key];
                      })
                  : undefined
              }
            />
          );
        })}
      </Accordion>
      {!credential && (
        <View style={{ backgroundColor: colorScheme.alert }}>
          <Typography color={colorScheme.alertText} align="center" style={styles.notice}>
            {translate('proofRequest.missingCredential.notice')}
          </Typography>
        </View>
      )}
      {potentialCredentials.length > 1 && (
        <View style={{ backgroundColor: colorScheme.notice }}>
          <Typography color={colorScheme.noticeText} align="center" style={styles.notice}>
            {translate('proofRequest.multipleCredentials.notice')}
          </Typography>
          <Button type="light" onPress={onSelect} style={styles.noticeButton}>
            {translate('proofRequest.multipleCredentials.select')}
          </Button>
        </View>
      )}
    </SharingScreen>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  dataItemLast: {
    borderBottomWidth: 0,
    marginBottom: 6,
  },
  dataItemLeft: {
    flex: 1,
  },
  dataWrapper: {
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 12,
    padding: 12,
  },
  headerLabel: {
    marginBottom: 4,
  },
  notice: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  noticeButton: {
    margin: 8,
  },
});

export default ProofRequestScreen;
