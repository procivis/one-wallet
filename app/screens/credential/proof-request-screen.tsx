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
import ONE, {
  CredentialListItem,
  CredentialSchema,
  CredentialStateEnum,
  ProofRequestClaim,
} from 'react-native-one-core';

import { MissingCredentialIcon } from '../../components/icon/credential-icon';
import { useCredentialDetail, useCredentials } from '../../hooks/credentials';
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
  status: SelectorStatus;
  last?: boolean;
  onPress?: () => void;
}> = ({ attribute, value, last, status, onPress }) => {
  const colorScheme = useAppColorScheme();
  const selector = <Selector status={status} />;
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

const sortByState = (a: CredentialListItem, b: CredentialListItem) => {
  if (a.state === b.state) return 0;
  if (a.state === CredentialStateEnum.REVOKED) return 1;
  if (b.state === CredentialStateEnum.REVOKED) return -1;
  return 0;
};

interface DisplayedCredential {
  schema: CredentialSchema;
  claims: ProofRequestClaim[];
  options: CredentialListItem[];
  selected: CredentialListItem | undefined;
}

const CredentialItem: FunctionComponent<{
  data: DisplayedCredential;
  onSelectCredential: () => void;
  selectedClaims: Set<ProofRequestClaim['id']>;
  onSelectClaim: (id: ProofRequestClaim['id'], selected: boolean) => void;
}> = ({ data, onSelectCredential, selectedClaims, onSelectClaim }) => {
  const colorScheme = useAppColorScheme();
  const { data: credential } = useCredentialDetail(data.selected?.id);
  return (
    <View style={styles.credential}>
      <Accordion
        title={data.schema.name}
        subtitle={
          credential?.issuanceDate
            ? formatDateTime(new Date(credential.issuanceDate))
            : translate('proofRequest.missingCredential.title')
        }
        subtitleStyle={credential ? undefined : { color: colorScheme.alertText }}
        icon={{
          component: credential ? (
            <TextAvatar produceInitials={true} text={data.schema.name} innerSize={48} />
          ) : (
            <MissingCredentialIcon style={styles.icon} />
          ),
        }}>
        {data.claims.map((attribute, index, { length }) => {
          const selected = selectedClaims.has(attribute.id);
          const status = (() => {
            if (!credential) return attribute.required ? SelectorStatus.LockedInvalid : SelectorStatus.Invalid;
            if (attribute.required) return SelectorStatus.LockedSelected;
            return selected ? SelectorStatus.SelectedCheck : SelectorStatus.Unselected;
          })();

          return (
            <DataItem
              key={attribute.id}
              attribute={attribute.key}
              value={credential?.claims.find(({ key }) => key === attribute.key)?.value}
              last={length === index + 1}
              status={status}
              onPress={credential && !attribute.required ? () => onSelectClaim(attribute.id, !selected) : undefined}
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
      {data.options.length > 1 && (
        <View style={{ backgroundColor: colorScheme.notice }}>
          <Typography color={colorScheme.noticeText} align="center" style={styles.notice}>
            {translate('proofRequest.multipleCredentials.notice')}
          </Typography>
          <Button type="light" onPress={onSelectCredential} style={styles.noticeButton}>
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

  const [selectedCredentials, setSelectedCredentials] = useState<
    Record<CredentialSchema['id'], CredentialListItem['id']>
  >({});

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

  const onSelectCredential = useCallback(
    (credentialSchemaId: CredentialSchema['id']) => () => {
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

  const [selectedClaims, setSelectedClaims] = useState<Record<CredentialSchema['id'], Set<ProofRequestClaim['id']>>>(
    () =>
      // initially all claims selected
      Object.entries(displayedData).reduce(
        (aggr, [credentialSchemaId, { claims }]) => ({
          ...aggr,
          [credentialSchemaId]: new Set(claims.map((claim) => claim.id)),
        }),
        {},
      ),
  );
  const onSelectClaim = useCallback(
    (credentialSchemaId: CredentialSchema['id']) => (id: ProofRequestClaim['id'], selected: boolean) => {
      setSelectedClaims((prev) => {
        const newlySelected = new Set(prev[credentialSchemaId]);
        if (selected) {
          newlySelected.add(id);
        } else {
          newlySelected.delete(id);
        }
        return { ...prev, [credentialSchemaId]: newlySelected };
      });
    },
    [],
  );

  const onReject = useCallback(() => {
    ONE.holderRejectProof().catch((e) => reportException(e, 'Reject Proof failure'));
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  const onSubmit = useCallback(() => {
    const credentialIds = Object.entries(displayedData)
      .map(([credentialSchemaId, { selected }]) => (selectedClaims[credentialSchemaId].size ? selected?.id : undefined))
      .filter((x): x is string => Boolean(x));

    sharingNavigation.navigate('Processing', { credentialIds });
  }, [sharingNavigation, displayedData, selectedClaims]);

  const allSelectionsValid =
    displayedData &&
    Object.values(displayedData).every(
      ({ selected, claims }) =>
        (selected && selected.state !== CredentialStateEnum.REVOKED) || claims.every((claim) => !claim.required),
    );

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
          <CredentialItem
            key={credentialSchemaId}
            data={data}
            onSelectCredential={onSelectCredential(credentialSchemaId)}
            selectedClaims={selectedClaims[credentialSchemaId]}
            onSelectClaim={onSelectClaim(credentialSchemaId)}
          />
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
