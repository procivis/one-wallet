import {
  Accordion,
  Button,
  concatTestID,
  formatDateTime,
  SelectorStatus,
  TextAvatar,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  Claim,
  CredentialDetail,
  CredentialListItem,
  CredentialStateEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import React, { FunctionComponent, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useCoreConfig } from '../../hooks/core-config';
import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  formatClaimValue,
  supportsSelectiveDisclosure,
} from '../../utils/credential';
import { MissingCredentialIcon } from '../icon/credential-icon';
import { ProofRequestAttribute } from './proof-request-attribute';
import { SelectiveDislosureNotice } from './selective-disclosure-notice';

interface DisplayedAttribute {
  claim?: Claim;
  field?: PresentationDefinitionField;
  id: string;
  selected?: boolean;
  status: SelectorStatus;
}

const getDisplayedAttributes = (
  request: PresentationDefinitionRequestedCredential,
  revoked: boolean,
  credential?: CredentialDetail,
  selectiveDisclosureSupported?: boolean,
  selectedFields?: string[],
): DisplayedAttribute[] => {
  if (credential && selectiveDisclosureSupported === false) {
    return credential.claims.map((claim) => ({
      claim,
      id: claim.id,
      status: SelectorStatus.LockedSelected,
    }));
  }

  return request.fields.map((field) => {
    const selected = selectedFields?.includes(field.id);
    const status = getAttributeSelectorStatus(
      field,
      revoked,
      credential,
      selected,
    );
    const claim = credential?.claims.find(
      ({ key }) => key === field.keyMap[credential.id],
    );
    return { claim, field, id: field.id, selected, status };
  });
};

const getAttributeSelectorStatus = (
  field: PresentationDefinitionField,
  revoked: boolean,
  credential?: CredentialDetail,
  selected?: boolean,
): SelectorStatus => {
  if (!credential || revoked) {
    return field.required
      ? SelectorStatus.LockedInvalid
      : SelectorStatus.Invalid;
  }
  if (field.required) {
    return SelectorStatus.LockedSelected;
  }
  return selected ? SelectorStatus.SelectedCheck : SelectorStatus.Unselected;
};

export const ProofRequestCredential: FunctionComponent<{
  allCredentials: CredentialListItem[];
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
}) => {
  const colorScheme = useAppColorScheme();
  const { data: credential, isLoading } =
    useCredentialDetail(selectedCredentialId);
  const { data: config } = useCoreConfig();

  const name = request.name ?? credential?.schema.name ?? request.id;

  const selectionOptions = useMemo(
    () =>
      request.applicableCredentials.filter((credentialId) =>
        allCredentials.some(
          ({ id, state }) =>
            id === credentialId && state === CredentialStateEnum.ACCEPTED,
        ),
      ),
    [allCredentials, request],
  );

  if (isLoading || !config) {
    return null;
  }

  const revoked = credential?.state === CredentialStateEnum.REVOKED;
  const selectiveDisclosureSupported = supportsSelectiveDisclosure(
    credential,
    config,
  );

  return (
    <View style={style}>
      <Accordion
        headerNotice={
          selectiveDisclosureSupported === false && (
            <SelectiveDislosureNotice
              style={styles.headerNotice}
              testID={concatTestID(testID, 'notice.selectiveDisclosure')}
            />
          )
        }
        icon={{
          component: credential ? (
            <TextAvatar innerSize={48} produceInitials={true} text={name} />
          ) : (
            <MissingCredentialIcon style={styles.icon} />
          ),
        }}
        subtitle={
          revoked
            ? translate('credentialDetail.log.revoke')
            : credential?.issuanceDate
            ? formatDateTime(new Date(credential.issuanceDate))
            : translate('proofRequest.missingCredential.title')
        }
        subtitleStyle={
          !credential || revoked
            ? {
                color: colorScheme.alertText,
                testID: concatTestID(
                  testID,
                  'subtitle',
                  revoked ? 'revoked' : 'missing',
                ),
              }
            : undefined
        }
        testID={testID}
        title={name}
        titleStyle={{ testID: concatTestID(testID, 'title', credential?.id) }}
      >
        {getDisplayedAttributes(
          request,
          revoked,
          credential,
          selectiveDisclosureSupported,
          selectedFields,
        ).map(({ claim, field, id, selected, status }, index, { length }) => {
          const attributeName = field?.name ?? claim?.key ?? id;
          return (
            <ProofRequestAttribute
              attribute={attributeName}
              key={id}
              last={length === index + 1}
              onPress={
                credential && field && !field.required
                  ? () => onSelectField(id, !selected)
                  : undefined
              }
              status={status}
              value={claim ? formatClaimValue(claim, config) : undefined}
            />
          );
        })}
      </Accordion>
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
      {revoked && (
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
      {selectionOptions.length > 1 && (
        <View
          style={{ backgroundColor: colorScheme.notice }}
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
    </View>
  );
};

const styles = StyleSheet.create({
  headerNotice: {
    marginTop: 8,
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
