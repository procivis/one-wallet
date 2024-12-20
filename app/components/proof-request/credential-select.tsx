import {
  Button,
  ButtonType,
  concatTestID,
  CredentialDetailsCardListItem,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  CredentialListItem,
  CredentialStateEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import React, { FunctionComponent, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useCoreConfig } from '../../hooks/core/core-config';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import { getValidityState, ValidityState } from '../../utils/credential';
import { shareCredentialCardFromCredential } from '../../utils/credential-sharing';

export const CredentialSelect: FunctionComponent<{
  allCredentials: CredentialListItem[];
  credentialId: string;
  expanded?: boolean;
  lastItem?: boolean;
  onHeaderPress?: (_credentialId?: string) => void;
  onSelectCredential?: () => void;
  onSelectField: (
    _id: PresentationDefinitionField['id'],
    _selected: boolean,
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
  const colorScheme = useAppColorScheme();
  const { data: credential, isLoading } =
    useCredentialDetail(selectedCredentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCredentialImagePreview();

  const selectionOptions = useMemo(
    () =>
      request.applicableCredentials
        .concat(request.inapplicableCredentials)
        .filter((applicableCredentialId) =>
          allCredentials.some(
            ({ id, state }) =>
              id === applicableCredentialId &&
              state === CredentialStateEnum.ACCEPTED,
          ),
        ),
    [allCredentials, request],
  );
  const multipleCredentialsAvailable = selectionOptions.length > 1;

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

  if (isLoading || !config) {
    return null;
  }

  const { card, attributes } = shareCredentialCardFromCredential(
    credential,
    invalid,
    Boolean(expanded),
    multipleCredentialsAvailable,
    request,
    selectedFields,
    config,
    testID,
  );

  const footer = (() => {
    if (validityState === ValidityState.Revoked) {
      return (
        <View
          style={[styles.notice, { backgroundColor: colorScheme.background }]}
          testID={concatTestID(testID, 'notice.revoked')}
        >
          <Typography
            align="center"
            color={colorScheme.text}
            preset="s/line-height-capped"
          >
            {translate('proofRequest.revokedCredential.notice')}
          </Typography>
        </View>
      );
    }
    if (validityState === ValidityState.Suspended) {
      return (
        <View
          style={[styles.notice, { backgroundColor: colorScheme.background }]}
          testID={concatTestID(testID, 'notice.suspended')}
        >
          <Typography
            align="center"
            color={colorScheme.text}
            preset="s/line-height-capped"
          >
            {translate('proofRequest.suspendedCredential.notice')}
          </Typography>
        </View>
      );
    }

    if (invalid) {
      return (
        <View
          style={[styles.notice, { backgroundColor: colorScheme.background }]}
          testID={concatTestID(testID, 'notice.invalid')}
        >
          <Typography
            align="center"
            color={colorScheme.text}
            preset="s/line-height-capped"
          >
            {translate('proofRequest.invalidCredential.notice')}
          </Typography>
        </View>
      );
    }

    if (multipleCredentialsAvailable) {
      return (
        <View
          style={[styles.notice, { backgroundColor: colorScheme.background }]}
          testID={concatTestID(testID, 'notice.multiple')}
        >
          <Typography
            align="center"
            color={colorScheme.text}
            preset="s/line-height-capped"
          >
            {translate('proofRequest.multipleCredentials.notice')}
          </Typography>
          <Button
            onPress={onSelectCredential}
            style={styles.noticeButton}
            testID={concatTestID(testID, 'notice.multiple.button')}
            title={translate('proofRequest.multipleCredentials.select')}
            type={ButtonType.Secondary}
          />
        </View>
      );
    }
  })();

  return (
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
      onAttributeSelected={onSelectField}
      onImagePreview={onImagePreview}
      style={[
        styles.credential,
        { borderColor: colorScheme.background },
        style,
      ]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  credential: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  notice: {
    marginBottom: 22,
    marginHorizontal: 12,
    padding: 12,
  },
  noticeButton: {
    marginTop: 24,
    paddingVertical: 11,
  },
});
