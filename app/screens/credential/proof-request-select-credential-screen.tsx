import {
  Accordion,
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

import { translate } from '../../i18n';
import { useStores } from '../../models';
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

  const { request, selectedCredentialId } = route.params;
  const {
    walletStore: { credentials },
  } = useStores();

  const potentialCredentials = useMemo(
    () => credentials.filter(({ schema }) => schema === request.credentialSchema),
    [credentials, request],
  );

  const [credentialId, setCredentialId] = useState<string>(selectedCredentialId);
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
      {potentialCredentials.map((credential) => {
        const selected = credential.id === credentialId;
        return (
          <View key={credential.id} style={styles.item}>
            <Accordion
              title={credential.schema}
              expanded={selected}
              onPress={selected ? undefined : () => setCredentialId(credential.id)}
              subtitle={translate('proofRequest.selectCredential.issued', {
                date: formatDateTime(credential.issuedOn),
              })}
              icon={{ component: <TextAvatar produceInitials={true} text={credential.schema} innerSize={48} /> }}
              rightAccessory={<Selector status={selected ? SelectorStatus.SelectedRadio : SelectorStatus.Unselected} />}
              contentStyle={styles.itemContent}>
              {request.attributes.map((attribute) => (
                <DataItem
                  key={attribute.key}
                  attribute={attribute.key}
                  value={credential.attributes.find(({ key }) => key === attribute.key)?.value ?? '-'}
                />
              ))}
            </Accordion>
          </View>
        );
      })}

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
