import {
  Button,
  ButtonType,
  concatTestID,
  ScrollViewScreen,
  SelectCredentialV2,
} from '@procivis/one-react-native-components';
import { CredentialListItemBindingDto } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import { uniq } from 'lodash';
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

const SelectCredentialV2Screen: FunctionComponent = () => {
  const navigation =
    useNavigation<ShareCredentialNavigationProp<'SelectCredentialV2'>>();
  const route = useRoute<ShareCredentialRouteProp<'SelectCredentialV2'>>();
  const onImagePreview = useCredentialImagePreview();

  const { preselectedCredentialIds, credentialQuery, credentialQueryId } =
    route.params;

  const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>(
    preselectedCredentialIds,
  );
  const canSubmitCredential = useMemo(() => {
    return selectedCredentialIds.length;
  }, [selectedCredentialIds]);

  const onConfirm = useCallback(() => {
    navigation.popTo(
      'ProofRequest',
      {
        selectedV2Credentials: {
          credentialQueryId,
          selectedCredentialIds,
        },
      } as ShareCredentialNavigatorParamList['ProofRequest'],
      { merge: true },
    );
  }, [credentialQueryId, navigation, selectedCredentialIds]);

  const selectionOptions =
    credentialQuery.credentialOrFailureHint.type_ === 'APPLICABLE_CREDENTIALS'
      ? credentialQuery.credentialOrFailureHint.applicableCredentials
      : [];

  const onCredentialSelected = useCallback(
    (credentialId: CredentialListItemBindingDto['id'], selected: boolean) => {
      setSelectedCredentialIds((prevSelection) => {
        let newSelection = [...prevSelection];
        if (credentialQuery.multiple) {
          if (selected) {
            newSelection = uniq(newSelection.concat(credentialId));
          } else {
            newSelection = newSelection.filter((id) => id !== credentialId);
          }
        } else if (selected) {
          newSelection = [credentialId];
        }
        return newSelection;
      });
    },
    [credentialQuery],
  );

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderBackButton testID="ProofRequestSelectCredentialScreen.header.back" />
        ),
        static: true,
        title: translate('common.selectCredential'),
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
        {selectionOptions.map((credential, index, { length }) => {
          const selected = selectedCredentialIds.includes(credential.id);
          return (
            <View key={credential.id} style={styles.item}>
              <SelectCredentialV2
                credential={credential}
                labels={shareCredentialCardLabels()}
                lastItem={index === length - 1}
                multiple={credentialQuery.multiple}
                onImagePreview={onImagePreview}
                onSelected={onCredentialSelected}
                selected={selected}
                testID={concatTestID(
                  'ProofRequestSelectCredentialScreen.credential',
                  credential.id,
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
          title={translate('common.select')}
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

export default SelectCredentialV2Screen;
