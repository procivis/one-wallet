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
import {
  Claim as CredentialClaim,
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
  getValidityState,
  supportsSelectiveDisclosure,
  ValidityState,
} from '../../utils/credential';
import { Claim } from '../credential/claim';
import { MissingCredentialIcon } from '../icon/credential-icon';
import { SelectiveDislosureNotice } from './selective-disclosure-notice';

interface DisplayedAttribute {
  claim?: CredentialClaim;
  field?: PresentationDefinitionField;
  id: string;
  selected?: boolean;
  status: SelectorStatus;
}

const getDisplayedAttributes = (
  request: PresentationDefinitionRequestedCredential,
  validityState: ValidityState,
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
      validityState,
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
  validityState: ValidityState,
  credential?: CredentialDetail,
  selected?: boolean,
): SelectorStatus => {
  if (!credential || validityState !== ValidityState.Valid) {
    return field.required
      ? SelectorStatus.LockedInvalid
      : SelectorStatus.Invalid;
  }
  if (field.required) {
    return SelectorStatus.LockedSelected;
  }
  return selected ? SelectorStatus.SelectedCheck : SelectorStatus.Unselected;
};

export const CredentialSelect: FunctionComponent<{
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

  const subtitle = useMemo(() => {
    if (validityState === ValidityState.Revoked) {
      return translate('proofRequest.revokedCredential.title');
    }
    if (validityState === ValidityState.Suspended) {
      return translate('proofRequest.suspendedCredential.title');
    }
    if (invalid) {
      return translate('proofRequest.invalidCredential.title');
    }
    return credential?.issuanceDate
      ? formatDateTime(new Date(credential.issuanceDate))
      : translate('proofRequest.missingCredential.title');
  }, [credential, invalid, validityState]);

  const subtitleStyle = useMemo(() => {
    if (!credential) {
      return {
        color: colorScheme.alertText,
        testID: concatTestID(testID, 'subtitle', 'missing'),
      };
    }
    if (validityState !== ValidityState.Valid) {
      return {
        color: colorScheme.alertText,
        testID: concatTestID(testID, 'subtitle', validityState),
      };
    }
    if (invalid) {
      return {
        color: colorScheme.noticeText,
        testID: concatTestID(testID, 'subtitle', 'invalid'),
      };
    }
  }, [
    colorScheme.alertText,
    colorScheme.noticeText,
    credential,
    invalid,
    validityState,
    testID,
  ]);

  if (isLoading || !config) {
    return null;
  }

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
            <TextAvatar
              innerSize={48}
              produceInitials={true}
              shape="rect"
              text={name}
            />
          ) : (
            <MissingCredentialIcon style={styles.icon} />
          ),
        }}
        subtitle={subtitle}
        subtitleStyle={subtitleStyle}
        testID={testID}
        title={name}
        titleStyle={{ testID: concatTestID(testID, 'title', credential?.id) }}
      >
        {getDisplayedAttributes(
          request,
          validityState,
          credential,
          selectiveDisclosureSupported,
          selectedFields,
        ).map(({ claim, field, id, selected, status }, index, { length }) => {
          const selector = <Selector status={status} />;
          return (
            <Claim
              claim={claim}
              key={id}
              last={length === index + 1}
              rightAccessory={
                credential && field && !field.required ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => onSelectField(id, !selected)}
                  >
                    {selector}
                  </TouchableOpacity>
                ) : (
                  selector
                )
              }
              style={[styles.claim, index === 0 && styles.firstClaim]}
              testID={concatTestID(testID, 'claim', `${index}`)}
              title={field?.name ?? claim?.key ?? id}
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
  claim: {
    paddingBottom: 14,
  },
  firstClaim: {
    marginTop: 24,
  },
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
