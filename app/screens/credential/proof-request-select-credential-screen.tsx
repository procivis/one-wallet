import {
  Accordion,
  Button,
  concatTestID,
  DetailScreen,
  formatDateTime,
  Selector,
  SelectorStatus,
  TextAvatar,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  CredentialStateEnum,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectiveDislosureNotice } from '../../components/proof-request/selective-disclosure-notice';
import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialDetail, useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialNavigatorParamList,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import {
  formatClaimValue,
  supportsSelectiveDisclosure,
} from '../../utils/credential';

const DataItem: FunctionComponent<{
  attribute: string;
  value: string;
}> = ({ attribute, value }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={styles.dataItem}>
      <Typography
        color={colorScheme.textSecondary}
        size="sml"
        style={styles.dataItemLabel}
      >
        {attribute}
      </Typography>
      <Typography color={colorScheme.text}>{value}</Typography>
    </View>
  );
};

const Credential: FunctionComponent<{
  credentialId: string;
  onPress?: () => void;
  request: PresentationDefinitionRequestedCredential;
  selected: boolean;
  testID?: string;
}> = ({ testID, credentialId, selected, request, onPress }) => {
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();
  if (!credential || !config) {
    return null;
  }

  const selectiveDisclosureSupported = supportsSelectiveDisclosure(
    credential,
    config,
  );

  return (
    <Accordion
      accessibilityState={{ selected }}
      contentStyle={styles.itemContent}
      expanded={selected}
      headerNotice={
        selectiveDisclosureSupported === false && (
          <SelectiveDislosureNotice
            style={styles.headerNotice}
            testID={concatTestID(testID, 'notice.selectiveDisclosure')}
          />
        )
      }
      icon={{
        component: (
          <TextAvatar
            innerSize={48}
            produceInitials={true}
            text={credential.schema.name}
          />
        ),
      }}
      onPress={onPress}
      rightAccessory={
        <Selector
          status={
            selected ? SelectorStatus.SelectedRadio : SelectorStatus.Unselected
          }
        />
      }
      subtitle={translate('proofRequest.selectCredential.issued', {
        date: formatDateTime(new Date(credential.issuanceDate)),
      })}
      testID={testID}
      title={credential.schema.name}
      titleStyle={{
        testID: concatTestID(testID, selected ? 'selected' : 'unselected'),
      }}
    >
      {request.fields.map((field) => {
        const claim = credential.claims.find(
          ({ key }) => key === field.keyMap[credentialId],
        );
        return (
          <DataItem
            attribute={field.name ?? claim?.key ?? field.id}
            key={field.id}
            value={claim ? formatClaimValue(claim, config) : '-'}
          />
        );
      })}
    </Accordion>
  );
};

const SelectCredentialScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<ShareCredentialNavigationProp<'SelectCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'SelectCredential'>>();
  const { data: allCredentials } = useCredentials();

  const { preselectedCredentialId, request } = route.params;

  const [selectedCredentialId, setSelectedCredentialId] = useState<string>(
    preselectedCredentialId,
  );
  const onConfirm = useCallback(() => {
    navigation.navigate({
      merge: true,
      name: 'ProofRequest',
      params: {
        selectedCredentialId,
      } as ShareCredentialNavigatorParamList['ProofRequest'],
    });
  }, [navigation, selectedCredentialId]);

  const selectionOptions = useMemo(
    () =>
      request.applicableCredentials.filter((credentialId) =>
        allCredentials?.some(
          ({ id, state }) =>
            id === credentialId && state === CredentialStateEnum.ACCEPTED,
        ),
      ),
    [allCredentials, request],
  );

  return (
    <DetailScreen
      onBack={navigation.goBack}
      testID="ProofRequestSelectCredentialScreen"
      title={translate('proofRequest.selectCredential.title')}
    >
      {selectionOptions.map((credentialId) => {
        const selected = selectedCredentialId === credentialId;
        return (
          <View key={credentialId} style={styles.item}>
            <Credential
              credentialId={credentialId}
              onPress={
                selected
                  ? undefined
                  : () => setSelectedCredentialId(credentialId)
              }
              request={request}
              selected={selected}
              testID={concatTestID(
                'ProofRequestSelectCredentialScreen.credential',
                credentialId,
              )}
            />
          </View>
        );
      })}

      <View style={styles.bottom}>
        <Button
          onPress={onConfirm}
          testID="ProofRequestSelectCredentialScreen.confirm"
        >
          {translate('proofRequest.selectCredential.select')}
        </Button>
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
  headerNotice: {
    marginTop: 8,
  },
  item: {
    marginBottom: 12,
  },
  itemContent: {
    paddingBottom: 12,
  },
});

export default SelectCredentialScreen;
