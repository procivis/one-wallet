import {
  AlertOutlineIcon,
  CredentialAttributeItemProps,
  CredentialCardProps,
  CredentialDetailsCardProps,
  CredentialErrorIcon,
  CredentialHeaderProps,
  CredentialWarningIcon,
  RequiredAttributeIcon,
} from '@procivis/one-react-native-components';
import {
  concatTestID,
  formatDate,
  formatDateTime,
  Selector,
  SelectorStatus,
  TouchableOpacity,
} from '@procivis/react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  CredentialListItem,
  CredentialStateEnum,
  DataTypeEnum,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import React from 'react';

import { translate } from '../../i18n';
import {
  getValidityState,
  supportsSelectiveDisclosure,
  ValidityState,
} from '../../utils/credential';

type CredentialAttribute = Omit<
  CredentialAttributeItemProps,
  'style' | 'onImagePreview' | 'last'
>;

export const cardHeaderFromCredentialListItem = (
  credential: CredentialListItem,
  testID?: string,
): Omit<CredentialHeaderProps, 'style'> => {
  let credentialDetail;
  let credentialDetailErrorColor;
  let credentialDetailTestID;
  let statusIcon;
  switch (credential.state) {
    case CredentialStateEnum.SUSPENDED:
      credentialDetail = translate('credentialDetail.log.suspended');
      credentialDetailTestID = concatTestID(testID, 'suspended');
      statusIcon = CredentialWarningIcon;
      break;
    case CredentialStateEnum.REVOKED:
      credentialDetail = translate('credentialDetail.log.revoked');
      credentialDetailErrorColor = true;
      credentialDetailTestID = concatTestID(testID, 'revoked');
      statusIcon = CredentialErrorIcon;
      break;
    default:
      credentialDetail =
        formatDateTime(new Date(credential.issuanceDate)) ?? '';
      break;
  }
  return {
    color: undefined,
    credentialDetail,
    credentialDetailErrorColor,
    credentialDetailTestID,
    credentialName: credential.schema.name,
    icon: undefined,
    iconLabelColor: undefined,
    statusIcon,
    testID,
  };
};

export const cardFromCredentialListItem = (
  credential: CredentialListItem,
  notice?: {
    notice: string;
    noticeIcon?: React.ComponentType<any> | React.ReactElement;
  },
  testID?: string,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  return {
    cardImage: undefined,
    color: undefined,
    header: cardHeaderFromCredentialListItem(credential, testID),
    ...notice,
  };
};

export const detailsCardAttributeFromClaim = (
  claim: Claim,
  config?: Config,
): CredentialAttribute => {
  let value;
  let image;
  const typeConfig = config?.datatype[claim.dataType];
  switch (typeConfig?.type) {
    case DataTypeEnum.Date: {
      value = formatDate(new Date(claim.value)) ?? claim.value;
      break;
    }
    case DataTypeEnum.File: {
      if (typeConfig.params?.showAs === 'IMAGE') {
        image = { uri: claim.value };
      } else {
        value = claim.value;
      }
      break;
    }
    default:
      value = claim.value;
      break;
  }
  return {
    id: claim.id,
    image,
    name: claim.key,
    value,
  };
};

export const detailsCardFromCredential = (
  credential: CredentialDetail,
  config?: Config,
  testID?: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const attributes: CredentialAttribute[] = credential.claims.map((claim) => {
    return detailsCardAttributeFromClaim(claim, config);
  });
  return {
    attributes,
    card: cardFromCredentialListItem(credential, undefined, testID),
  };
};

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
    return field.required
      ? SelectorStatus.LockedInvalid
      : SelectorStatus.Invalid;
  }
  if (field.required) {
    return SelectorStatus.LockedSelected;
  }
  return selected ? SelectorStatus.SelectedCheck : SelectorStatus.Unselected;
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
      status={
        selected ? SelectorStatus.SelectedRadio : SelectorStatus.Unselected
      }
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
