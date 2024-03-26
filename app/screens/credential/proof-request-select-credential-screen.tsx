import {
  Button,
  concatTestID,
  DetailScreen,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { Credential } from '../../components/proof-request/credential';
import { useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialNavigatorParamList,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';

const SelectCredentialScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<ShareCredentialNavigationProp<'SelectCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'SelectCredential'>>();
  const colorScheme = useAppColorScheme();
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
      contentStyle={[
        styles.container,
        { backgroundColor: colorScheme.background },
      ]}
      onBack={navigation.goBack}
      testID="ProofRequestSelectCredentialScreen"
      title={translate('proofRequest.selectCredential.title')}
    >
      {selectionOptions.map((credentialId, index, { length }) => {
        const selected = selectedCredentialId === credentialId;
        return (
          <View key={credentialId} style={styles.item}>
            <Credential
              credentialId={credentialId}
              lastItem={index === length - 1}
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  item: {
    marginBottom: 12,
  },
});

export default SelectCredentialScreen;
