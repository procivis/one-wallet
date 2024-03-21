import { CredentialDetailsCardListItem } from '@procivis/one-react-native-components';
import {
  Button,
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  CredentialListItem,
  CredentialStateEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { getValidityState, ValidityState } from '../../utils/credential';
import { shareCredentialCardFromCredential } from '../credential/parsers';

export const CredentialSelect: FunctionComponent<{
  allCredentials: CredentialListItem[];
  credentialId: string;
  expanded?: boolean;
  lastItem?: boolean;
  onHeaderPress?: (credentialId?: string) => void;
  onSelectCredential?: () => void;
  onSelectField: (
    id: PresentationDefinitionField['id'],
    selected: boolean,
  ) => void;
  request: PresentationDefinitionRequestedCredential;
  selectedCredentialId?: CredentialListItem['id'];
  selectedFields?: Array<PresentationDefinitionField['id']>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}> = ({
  testID,
  style,
  request,
  allCredentials,
  selectedCredentialId,
  onSelectCredential,
  selectedFields,
  onSelectField,
  credentialId,
  expanded,
  lastItem,
  onHeaderPress,
}) => {
  const rootNavigation = useNavigation<RootNavigationProp<any>>();
  const colorScheme = useAppColorScheme();
  const { data: credential, isLoading } =
    useCredentialDetail(selectedCredentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCallback(
    (title: string, image: ImageSourcePropType) => {
      rootNavigation.navigate('ImagePreview', {
        image,
        title,
      });
    },
    [rootNavigation],
  );

  const selectionOptions = useMemo(
    () =>
      request.applicableCredentials.filter((applicableCredentialId) =>
        allCredentials.some(
          ({ id, state }) =>
            id === applicableCredentialId &&
            state === CredentialStateEnum.ACCEPTED,
        ),
      ),
    [allCredentials, request],
  );

  const validityState = getValidityState(credential);

  const invalid = useMemo(() => {
    if (!credential?.lvvcIssuanceDate || !request.validityCredentialNbf) {
      return false;
    }
    return (
      new Date(credential.lvvcIssuanceDate) <
      new Date(request.validityCredentialNbf)
    );
  }, [credential, request]);

  if (isLoading || !credential || !config) {
    return null;
  }

  const { card, attributes } = shareCredentialCardFromCredential(
    credential,
    invalid,
    request,
    selectedFields,
    onSelectField,
    config,
    testID,
  );

  const footer = (
    <>
      {!credential && (
        <View
          style={{ backgroundColor: colorScheme.alert }}
          testID={concatTestID(testID, 'notice.missing')}
        >
          <Typography
            align="center"
            color={colorScheme.alertText}
            style={styles.notice}
          >
            {translate('proofRequest.missingCredential.notice')}
          </Typography>
        </View>
      )}
      {validityState === ValidityState.Revoked && (
        <View
          style={{ backgroundColor: colorScheme.alert }}
          testID={concatTestID(testID, 'notice.revoked')}
        >
          <Typography
            align="center"
            color={colorScheme.alertText}
            style={styles.notice}
          >
            {translate('proofRequest.revokedCredential.notice')}
          </Typography>
        </View>
      )}
      {validityState === ValidityState.Suspended && (
        <View
          style={{ backgroundColor: colorScheme.alert }}
          testID={concatTestID(testID, 'notice.suspended')}
        >
          <Typography
            align="center"
            color={colorScheme.alertText}
            style={styles.notice}
          >
            {translate('proofRequest.suspendedCredential.notice')}
          </Typography>
        </View>
      )}
      {invalid && (
        <View
          style={{ backgroundColor: colorScheme.notice }}
          testID={concatTestID(testID, 'notice.invalid')}
        >
          <Typography
            align="center"
            color={colorScheme.noticeText}
            style={styles.notice}
          >
            {translate('proofRequest.invalidCredential.notice')}
          </Typography>
        </View>
      )}
      {selectionOptions.length > 1 && (
        <View
          style={{ backgroundColor: colorScheme.background }}
          testID={concatTestID(testID, 'notice.multiple')}
        >
          <Typography
            align="center"
            color={colorScheme.noticeText}
            style={styles.notice}
          >
            {translate('proofRequest.multipleCredentials.notice')}
          </Typography>
          <Button
            onPress={onSelectCredential}
            style={styles.noticeButton}
            testID={concatTestID(testID, 'notice.multiple.button')}
            type="light"
          >
            {translate('proofRequest.multipleCredentials.select')}
          </Button>
        </View>
      )}
    </>
  );

  return (
    <View style={style}>
      <CredentialDetailsCardListItem
        attributes={attributes}
        card={{
          ...card,
          credentialId,
          onHeaderPress,
        }}
        expanded={expanded}
        footer={footer}
        lastItem={lastItem}
        onImagePreview={onImagePreview}
        style={styles.credential}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 8,
  },
  notice: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  noticeButton: {
    margin: 8,
  },
});
