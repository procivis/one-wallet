import { Button, concatTestID } from '@procivis/one-react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HeaderBackButton } from '../../components/navigation/header-buttons';
import { Credential } from '../../components/proof-request/credential';
import ScrollViewScreen from '../../components/screens/scroll-view-screen';
import { useCredentials } from '../../hooks/core/credentials';
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
    <ScrollViewScreen
      header={{
        leftItem: HeaderBackButton,
        modalHandleVisible: Platform.OS === 'ios',
        static: true,
        title: translate('proofRequest.selectCredential.title'),
      }}
      modalPresentation
      testID="ProofRequestSelectCredentialScreen"
    >
      <View
        style={styles.content}
        testID="ProofRequestSelectCredentialScreen.content"
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
      </View>
      <View style={styles.bottom}>
        <Button
          onPress={onConfirm}
          testID="ProofRequestSelectCredentialScreen.confirm"
          title={translate('proofRequest.selectCredential.select')}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 64,
    paddingHorizontal: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  item: {
    marginBottom: 12,
  },
});

export default SelectCredentialScreen;
