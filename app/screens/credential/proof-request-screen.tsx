import {
  Accordion,
  ActivityIndicator,
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
import ONE, { Credential, CredentialSchema, CredentialState, ProofRequestClaim } from 'react-native-one-core';

import { MissingCredentialIcon } from '../../components/icon/credential-icon';
import { useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { reportException } from '../../utils/reporting';

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

const sortByState = (a: Credential, b: Credential) => {
  if (a.state === b.state) return 0;
  if (a.state === CredentialState.REVOKED) return 1;
  if (b.state === CredentialState.REVOKED) return -1;
  return 0;
};

interface DisplayedCredential {
  schema: CredentialSchema;
  claims: ProofRequestClaim[];
  options: Credential[];
  selected: Credential | undefined;
}

const CredentialItem: FunctionComponent<{
  data: DisplayedCredential;
  onSelect?: () => void;
}> = ({ data, onSelect }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.credential}>
      <Accordion
        title={data.schema.name}
        subtitle={
          data.selected?.issuanceDate
            ? formatDateTime(new Date(data.selected.issuanceDate))
            : translate('proofRequest.missingCredential.title')
        }
        subtitleStyle={data.selected ? undefined : { color: colorScheme.alertText }}
        icon={{
          component: data.selected ? (
            <TextAvatar produceInitials={true} text={data.schema.name} innerSize={48} />
          ) : (
            <MissingCredentialIcon style={styles.icon} />
          ),
        }}>
        {data.claims.map((attribute, index, { length }) => {
          const status = (() => {
            if (!data.selected) return attribute.required ? SelectorStatus.LockedInvalid : SelectorStatus.Invalid;
            if (attribute.required) return SelectorStatus.LockedSelected;
            return SelectorStatus.SelectedCheck;
          })();

          return (
            <DataItem
              key={attribute.key}
              attribute={attribute.key}
              value={data.selected?.claims.find(({ key }) => key === attribute.key)?.value}
              last={length === index + 1}
              status={status}
              onPress={undefined}
            />
          );
        })}
      </Accordion>
      {!data.selected && (
        <View style={{ backgroundColor: colorScheme.alert }}>
          <Typography color={colorScheme.alertText} align="center" style={styles.notice}>
            {translate('proofRequest.missingCredential.notice')}
          </Typography>
        </View>
      )}
      {data.options.length > 1 && (
        <View style={{ backgroundColor: colorScheme.notice }}>
          <Typography color={colorScheme.noticeText} align="center" style={styles.notice}>
            {translate('proofRequest.multipleCredentials.notice')}
          </Typography>
          <Button type="light" onPress={onSelect} style={styles.noticeButton}>
            {translate('proofRequest.multipleCredentials.select')}
          </Button>
        </View>
      )}
    </View>
  );
};

const ProofRequestScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp<'ShareCredential'>>();
  const sharingNavigation = useNavigation<ShareCredentialNavigationProp<'ProofRequest'>>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();

  useBlockOSBackNavigation();

  const { request, selectedCredentialId } = route.params;

  const { data: credentials, isLoading } = useCredentials();

  const [selectedCredentials, setSelectedCredentials] = useState<Record<CredentialSchema['id'], Credential['id']>>({});

  const displayedData = useMemo(() => {
    const schemaIds = request.claims.reduce((aggr, curr) => aggr.add(curr.credentialSchema.id), new Set<string>());
    return Array.from(schemaIds).reduce<Record<CredentialSchema['id'], DisplayedCredential>>((aggr, schemaId) => {
      const claims = request.claims.filter((claim) => claim.credentialSchema.id === schemaId);
      const options = credentials?.filter((credential) => credential.schema.id === schemaId) ?? [];
      options.sort(sortByState);
      const selectedId = selectedCredentials[schemaId];
      return {
        ...aggr,
        [schemaId]: {
          schema: claims[0].credentialSchema,
          claims,
          options,
          selected: selectedId ? options.find((option) => option.id === selectedId) : options[0],
        },
      };
    }, {});
  }, [request, credentials, selectedCredentials]);

  const onReject = useCallback(() => {
    ONE.holderRejectProof().catch((e) => reportException(e, 'Reject Proof failure'));
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  const onSubmit = useCallback(() => {
    const credentialIds = Object.values(displayedData)
      .map(({ selected }) => selected?.id)
      .filter((x): x is string => Boolean(x));

    sharingNavigation.navigate('Processing', { credentialIds });
  }, [sharingNavigation, displayedData]);

  const onSelect = useCallback(
    (credentialSchemaId: string) => () => {
      const { selected, options } = displayedData[credentialSchemaId];
      sharingNavigation.navigate('SelectCredential', {
        preselectedCredentialId: selected?.id ?? '',
        options: options.map(({ id }) => id),
        request,
      });
    },
    [sharingNavigation, displayedData, request],
  );
  // result of selection is propagated using the navigation param `selectedCredentialId`
  useEffect(() => {
    if (selectedCredentialId) {
      const credential = credentials?.find(({ id }) => id === selectedCredentialId);
      if (credential) {
        setSelectedCredentials((prev) => ({ ...prev, [credential.schema.id]: selectedCredentialId }));
      }
    }
  }, [selectedCredentialId, credentials]);

  const allSelectionsValid =
    displayedData &&
    Object.values(displayedData).every(({ selected }) => selected && selected.state !== CredentialState.REVOKED);

  // temporary API missing verifier info
  const verifierName = 'Unknown';

  return (
    <SharingScreen
      variation={SharingScreenVariation.Neutral}
      title={translate('proofRequest.title')}
      contentTitle={translate('proofRequest.attributes')}
      cancelLabel={translate('common.cancel')}
      onCancel={onReject}
      submitLabel={translate('proofRequest.confirm')}
      onSubmit={allSelectionsValid ? onSubmit : undefined}
      header={
        <>
          <View style={styles.header}>
            <Typography size="sml" bold={true} caps={true} style={styles.headerLabel} accessibilityRole="header">
              {translate('proofRequest.verifier')}
            </Typography>
            <Typography color={colorScheme.text}>{verifierName}</Typography>
          </View>
        </>
      }>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        Object.entries(displayedData).map(([credentialSchemaId, data]) => (
          <CredentialItem key={credentialSchemaId} data={data} onSelect={onSelect(credentialSchemaId)} />
        ))
      )}
    </SharingScreen>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 24,
  },
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
  header: {
    padding: 12,
  },
  headerLabel: {
    marginBottom: 4,
  },
  icon: {
    borderRadius: 3,
    overflow: 'hidden',
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
