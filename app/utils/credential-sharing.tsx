import {
  AlertOutlineIcon,
  concatTestID,
  CredentialAttribute,
  CredentialCardProps,
  CredentialDetailsCardProps,
  RequiredAttributeIcon,
  Selector,
  SelectorStatus,
  TouchableOpacity,
} from '@procivis/one-react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  CredentialListItem,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import React from 'react';

import { translate } from '../i18n';
import {
  cardFromCredentialListItem,
  cardHeaderFromCredentialListItem,
  detailsCardAttributeFromClaim,
  getValidityState,
  supportsSelectiveDisclosure,
  ValidityState,
} from './credential';

export const validityCheckedCardFromCredentialListItem = (
  credential: CredentialListItem,
  invalid: boolean,
  notice:
    | {
        notice: string;
        noticeIcon?: React.ComponentType<any> | React.ReactElement;
      }
    | undefined,
  testID?: string,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  let invalidCredentialHeaderDetail;
  if (invalid) {
    invalidCredentialHeaderDetail = {
      credentialDetail: translate('credentialDetail.log.revoked'),
      credentialDetailErrorColor: true,
      credentialDetailTestID: concatTestID(testID, 'invalid'),
    };
  }
  return {
    cardImage: undefined,
    color: undefined,
    header: {
      ...cardHeaderFromCredentialListItem(credential),
      ...invalidCredentialHeaderDetail,
    },
    ...notice,
  };
};

export const missingCredentialCardFromRequest = (
  request: PresentationDefinitionRequestedCredential,
  notice:
    | {
        notice: string;
        noticeIcon?: React.ComponentType<any> | React.ReactElement;
      }
    | undefined,
  testID: string | undefined,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  return {
    cardImage: undefined,
    color: undefined,
    header: {
      credentialDetail: translate('proofRequest.missingCredential.title'),
      credentialDetailErrorColor: true,
      credentialDetailTestID: concatTestID(testID, 'subtitle', 'missing'),
      credentialName: request.name ?? request.id,
      icon: undefined,
      iconLabelColor: undefined,
    },
    ...notice,
  };
};

interface DisplayedAttribute {
  claim?: Claim;
  field?: PresentationDefinitionField;
  id: string;
  selected?: boolean;
  status: SelectorStatus;
}

const getAttributeSelectorStatus = (
  field: PresentationDefinitionField,
  validityState: ValidityState,
  credential?: CredentialDetail,
  selected?: boolean,
): SelectorStatus => {
  if (!credential || validityState !== ValidityState.Valid) {
    return SelectorStatus.Rejected;
  }
  if (field.required) {
    return SelectorStatus.Required;
  }
  return selected ? SelectorStatus.SelectedCheckmark : SelectorStatus.Empty;
};

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
      status: SelectorStatus.Required,
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

export const shareCredentialCardAttributeFromClaim = (
  id: string,
  claim?: Claim,
  field?: PresentationDefinitionField,
  config?: Config,
): CredentialAttribute => {
  if (claim) {
    return detailsCardAttributeFromClaim(claim, config);
  }
  return {
    id: id,
    name: field?.name ?? id,
    value: translate('proofRequest.missingAttribute'),
    valueErrorColor: true,
  };
};

export const shareCredentialCardFromCredential = (
  credential: CredentialDetail | undefined,
  invalid: boolean,
  request: PresentationDefinitionRequestedCredential,
  selectedFields: string[] | undefined,
  onSelectField: (
    id: PresentationDefinitionField['id'],
    selected: boolean,
  ) => void,
  config: Config,
  testID: string | undefined,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const selectiveDisclosureSupported = supportsSelectiveDisclosure(
    credential,
    config,
  );
  const notice =
    selectiveDisclosureSupported === false
      ? {
          notice: translate('proofRequest.selectiveDisclosure.notice'),
          noticeIcon: AlertOutlineIcon,
        }
      : undefined;
  const card = credential
    ? validityCheckedCardFromCredentialListItem(
        credential,
        invalid,
        notice,
        testID,
      )
    : missingCredentialCardFromRequest(request, notice, testID);
  const validityState = getValidityState(credential);
  const attributes: CredentialAttribute[] = getDisplayedAttributes(
    request,
    validityState,
    credential,
    selectiveDisclosureSupported,
    selectedFields,
  ).map(({ claim, field, id, selected, status }, index) => {
    const selector = <Selector status={status} />;
    const rightAccessory =
      credential && field && !field.required ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onSelectField(id, !selected)}
        >
          {selector}
        </TouchableOpacity>
      ) : (
        selector
      );
    const attribute: CredentialAttribute = {
      ...shareCredentialCardAttributeFromClaim(id, claim, field, config),
      rightAccessory,
      testID: concatTestID(testID, 'claim', `${index}`),
    };
    return attribute;
  });
  return {
    attributes,
    card,
  };
};

export const selectCredentialCardAttributeFromClaim = (
  id: string,
  claim?: Claim,
  field?: PresentationDefinitionField,
  config?: Config,
): CredentialAttribute => {
  const attribute = shareCredentialCardAttributeFromClaim(
    id,
    claim,
    field,
    config,
  );
  if (!claim) {
    return attribute;
  }
  return {
    ...attribute,
    rightAccessory: RequiredAttributeIcon,
  };
};

export const selectCredentialCardFromCredential = (
  credential: CredentialDetail,
  selected: boolean,
  request: PresentationDefinitionRequestedCredential,
  config: Config,
  testID?: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const selectiveDisclosureSupported = supportsSelectiveDisclosure(
    credential,
    config,
  );
  const rightAccessory = (
    <Selector
      status={selected ? SelectorStatus.SelectedRadio : SelectorStatus.Empty}
    />
  );
  const notice =
    selectiveDisclosureSupported === false
      ? {
          notice: translate('proofRequest.selectiveDisclosure.notice'),
          noticeIcon: AlertOutlineIcon,
        }
      : undefined;
  const { header, ...cardProps } = cardFromCredentialListItem(
    credential,
    notice,
    testID,
  );
  const card = {
    header: {
      ...header,
      accessory: rightAccessory,
    },
    ...cardProps,
  };
  const attributes: CredentialAttribute[] = request.fields.map((field) => {
    const claim = credential.claims.find(
      ({ key }) => key === field.keyMap[credential.id],
    );
    const attribute = selectCredentialCardAttributeFromClaim(
      field.id,
      claim,
      field,
      config,
    );
    return {
      ...attribute,
      rightAccessory: RequiredAttributeIcon,
    };
  });
  return {
    attributes,
    card,
  };
};
