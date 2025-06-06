import {
  Button,
  ButtonType,
  concatTestID,
  ScrollViewScreen,
  SelectCredential,
  useCredentials,
} from '@procivis/one-react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { HeaderBackButton } from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialNavigatorParamList,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { shareCredentialCardLabels } from '../../utils/credential-sharing';

const SelectCredentialScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<ShareCredentialNavigationProp<'SelectCredential'>>();
  const route = useRoute<ShareCredentialRouteProp<'SelectCredential'>>();
  const onImagePreview = useCredentialImagePreview();
  const { data: allCredentials } = useCredentials();

  const { preselectedCredentialId, request } = route.params;

  const [selectedCredentialId, setSelectedCredentialId] = useState<string>(
    preselectedCredentialId,
  );
  const canSubmitCredential = useMemo(() => {
    return request.applicableCredentials.includes(selectedCredentialId);
  }, [request.applicableCredentials, selectedCredentialId]);
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
      request.inapplicableCredentials
        .concat(request.applicableCredentials)
        .filter((credentialId) =>
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
        leftItem: (
          <HeaderBackButton testID="ProofRequestSelectCredentialScreen.header.back" />
        ),
        static: true,
        title: translate('proofRequest.selectCredential.title'),
      }}
      modalPresentation
      scrollView={{
        testID: 'ProofRequestSelectCredentialScreen.scroll',
      }}
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
              <SelectCredential
                credentialId={credentialId}
                labels={shareCredentialCardLabels()}
                lastItem={index === length - 1}
                onImagePreview={onImagePreview}
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
          disabled={!canSubmitCredential}
          onPress={onConfirm}
          testID="ProofRequestSelectCredentialScreen.confirm"
          title={translate('proofRequest.selectCredential.select')}
          type={canSubmitCredential ? ButtonType.Primary : ButtonType.Secondary}
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
