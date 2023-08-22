import {
  Accordion,
  ActivityIndicator,
  Button,
  DetailScreen,
  formatDateTime,
  Selector,
  SelectorStatus,
  TextAvatar,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Credential } from 'react-native-one-core';

import { useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialNavigatorParamList,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';

const DataItem: FunctionComponent<{
  attribute: string;
  value: string;
}> = ({ attribute, value }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.dataItem}>
      <Typography color={colorScheme.textSecondary} size="sml" style={styles.dataItemLabel}>
        {attribute}
      </Typography>
      <Typography color={colorScheme.text}>{value}</Typography>
    </View>
  );
};

const SelectCredentialScreen: FunctionComponent = () => {
  const navigation = useNavigation<ShareCredentialNavigationProp<'SelectCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'SelectCredential'>>();

  const { preselectedCredentialId, options, request } = route.params;
  const { data: credentials, isLoading } = useCredentials();

  const potentialCredentials = useMemo(
    () =>
      options
        .map((credentialId) => credentials?.find(({ id }) => id === credentialId))
        .filter((x): x is Credential => Boolean(x)),
    [credentials, options],
  );

  const [credentialId, setCredentialId] = useState<string>(preselectedCredentialId);
  const onConfirm = useCallback(() => {
    navigation.navigate({
      name: 'ProofRequest',
      merge: true,
      params: {
        selectedCredentialId: credentialId,
      } as ShareCredentialNavigatorParamList['ProofRequest'],
    });
  }, [navigation, credentialId]);

  return (
    <DetailScreen onBack={navigation.goBack} title={translate('proofRequest.selectCredential.title')}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        potentialCredentials.map((credential) => {
          const selected = credential.id === credentialId;
          return (
            <View key={credential.id} style={styles.item}>
              <Accordion
                title={credential.schema.name}
                accessibilityState={{ selected }}
                expanded={selected}
                onPress={selected ? undefined : () => setCredentialId(credential.id)}
                subtitle={translate('proofRequest.selectCredential.issued', {
                  date: formatDateTime(new Date(credential.issuanceDate)),
                })}
                icon={{ component: <TextAvatar produceInitials={true} text={credential.schema.name} innerSize={48} /> }}
                rightAccessory={
                  <Selector status={selected ? SelectorStatus.SelectedRadio : SelectorStatus.Unselected} />
                }
                contentStyle={styles.itemContent}>
                {request.claims.map((claim) => (
                  <DataItem
                    key={claim.key}
                    attribute={claim.key}
                    value={credential.claims.find(({ key }) => key === claim.key)?.value ?? '-'}
                  />
                ))}
              </Accordion>
            </View>
          );
        })
      )}

      <View style={styles.bottom}>
        <Button onPress={onConfirm}>{translate('proofRequest.selectCredential.select')}</Button>
      </View>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dataItem: {
    marginBottom: 3,
    marginTop: 12,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  item: {
    marginBottom: 12,
  },
  itemContent: {
    paddingBottom: 12,
  },
});

export default SelectCredentialScreen;
