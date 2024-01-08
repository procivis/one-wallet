import {
  Accordion,
  Button,
  concatTestID,
  formatDateTime,
  Selector,
  SelectorStatus,
  TextAvatar,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import React, { FunctionComponent, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  CredentialListItem,
  CredentialStateEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from 'react-native-one-core';

import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { formatClaimValue } from '../../utils/credential';
import { MissingCredentialIcon } from '../icon/credential-icon';

const DataItem: FunctionComponent<{
  attribute: string;
  last?: boolean;
  onPress?: () => void;
  status: SelectorStatus;
  value: string | undefined;
}> = ({ attribute, value, last, status, onPress }) => {
  const colorScheme = useAppColorScheme();
  const selector = <Selector status={status} />;
  return (
    <View
      style={[
        styles.dataItem,
        last && styles.dataItemLast,
        { borderColor: colorScheme.lighterGrey },
      ]}
    >
      <View style={styles.dataItemLeft}>
        <Typography
          color={colorScheme.textSecondary}
          size="sml"
          style={styles.dataItemLabel}
        >
          {attribute}
        </Typography>
        <Typography color={value ? colorScheme.text : colorScheme.alertText}>
          {value ?? translate('proofRequest.missingAttribute')}
        </Typography>
      </View>
      {selector && onPress ? (
        <TouchableOpacity accessibilityRole="button" onPress={onPress}>
          {selector}
        </TouchableOpacity>
      ) : (
        selector
      )}
    </View>
  );
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

  if (isLoading) {
    return null;
  }

  const revoked = credential?.state === CredentialStateEnum.REVOKED;

  return (
    <View style={style}>
      <Accordion
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
        {request.fields.map((field, index, { length }) => {
          const selected = selectedFields?.includes(field.id);
          const status = (() => {
            if (!credential || revoked) {
              return field.required
                ? SelectorStatus.LockedInvalid
                : SelectorStatus.Invalid;
            }
            if (field.required) {
              return SelectorStatus.LockedSelected;
            }
            return selected
              ? SelectorStatus.SelectedCheck
              : SelectorStatus.Unselected;
          })();

          const claim = credential?.claims.find(
            ({ key }) => key === field.keyMap[credential.id],
          );
          const attributeName = field.name ?? claim?.key ?? field.id;

          return (
            <DataItem
              attribute={attributeName}
              key={field.id}
              last={length === index + 1}
              onPress={
                credential && !field.required
                  ? () => onSelectField(field.id, !selected)
                  : undefined
              }
              status={status}
              value={claim ? formatClaimValue(claim) : undefined}
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
  dataItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  dataItemLast: {
    borderBottomWidth: 0,
    marginBottom: 6,
  },
  dataItemLeft: {
    flex: 1,
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
