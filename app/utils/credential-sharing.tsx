import {
  concatTestID,
  CredentialAttribute,
  CredentialCardProps,
  CredentialDetailsCardProps,
  CredentialHeaderProps,
  CredentialNoticeWarningIcon,
  CredentialWarningIcon,
  RequiredAttributeIcon,
  Selector,
  SelectorStatus,
} from '@procivis/one-react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  PresentationDefinitionField,
  PresentationDefinitionRequestedCredential,
} from '@procivis/react-native-one-core';
import React from 'react';

import { translate } from '../i18n';
import {
  detailsCardAttributeFromClaim,
  getCredentialCardPropsFromCredential,
  getValidityState,
  nestAttributes,
  supportsSelectiveDisclosure,
  ValidityState,
} from './credential';

export const validityCheckedCardFromCredential = (
  credential: CredentialDetail,
  invalidLVVC: boolean,
  expanded: boolean,
  multipleCredentialsAvailable: boolean,
  config: Config | undefined,
  notice:
    | {
        notice: string;
        noticeIcon?: React.ComponentType<any> | React.ReactElement;
      }
    | undefined,
  testID?: string,
): Omit<CredentialCardProps, 'onHeaderPress' | 'style' | 'testID'> => {
  let credentialHeaderDetail:
    | Pick<
        CredentialHeaderProps,
        | 'credentialDetailPrimary'
        | 'credentialDetailSecondary'
        | 'credentialDetailErrorColor'
        | 'credentialDetailTestID'
        | 'statusIcon'
      >
    | undefined;
  if (invalidLVVC) {
    credentialHeaderDetail = {
      credentialDetailErrorColor: true,
      credentialDetailPrimary: translate('credentialDetail.log.revoked'),
      credentialDetailTestID: concatTestID(testID, 'invalid'),
    };
  } else if (!expanded && multipleCredentialsAvailable) {
    credentialHeaderDetail = {
      credentialDetailPrimary: translate(
        'proofRequest.multipleCredentials.detail',
      ),
      credentialDetailTestID: concatTestID(testID, 'multiple'),
      statusIcon: CredentialWarningIcon,
    };
  }

  const card = getCredentialCardPropsFromCredential(
    credential,
    credential.claims,
    config,
    notice,
    testID,
  );
  return {
    ...card,
    header: {
      ...card.header,
      ...credentialHeaderDetail,
    },
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
      credentialDetailErrorColor: true,
      credentialDetailPrimary: translate(
        'proofRequest.missingCredential.title',
      ),
      credentialDetailTestID: concatTestID(testID, 'subtitle', 'missing'),
      credentialName: request.name ?? request.id,
      statusIcon: CredentialWarningIcon,
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

// Returns a spread list of all claims with their full JSON path as key, including all intermediate objects
const spreadClaims = (claims: Claim[], parentClaimPath = ''): Claim[] => {
  return claims.reduce((acc, claim) => {
    const claimPath = parentClaimPath
      ? `${parentClaimPath}/${claim.key}`
      : claim.key;
    const result = [{ ...claim, key: claimPath }];
    if (Array.isArray(claim.value)) {
      result.push(...spreadClaims(claim.value, claimPath));
    }
    return [...acc, ...result];
  }, [] as Claim[]);
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
    const selected = !field.required && selectedFields?.includes(field.id);
    const status = getAttributeSelectorStatus(
      field,
      validityState,
      credential,
      selected,
    );

    const claim =
      credential &&
      spreadClaims(credential.claims).find(({ key }) => {
        return key === field.keyMap[credential.id];
      });
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
    return { ...detailsCardAttributeFromClaim(claim, config), id };
  }
  return {
    id,
    name: field?.name ?? id,
    value: translate('proofRequest.missingAttribute'),
    valueErrorColor: true,
  };
};

// Will propagate the attribute status (right accessory + selected?) for all nested attributes
// Note: This function MUTATES the input attribute
const setStatusForNestedObjectFields = (
  attribute: CredentialAttribute,
  status?: SelectorStatus,
  disabled?: boolean,
) => {
  const accessory = status && <Selector status={status} />;
  const isObject = attribute.attributes && attribute.attributes.length > 0;

  // If the attribute is not an object, we update the attribute and return
  if (!isObject) {
    attribute.rightAccessory = accessory;
    attribute.disabled = disabled;
    return attribute;
  } else {
    // The object can be optional (tappable radio-checkmark), or required (checkmark)
    if (
      status === SelectorStatus.SelectedCheckmark ||
      status === SelectorStatus.Empty
    ) {
      // If it's a selectable object, the accessory is rendered next to the object title,
      // The nested attributes have no accessory, and can not be selected
      attribute.rightAccessory = accessory;
      setStatusForNestedObjectFields(attribute, undefined, true);
    } else {
      // If the object is required / rejected, the accessory is rendered next to each nested attribute (except other object titles)
      // all fields are disabled
      for (const nestedAttribute of attribute.attributes) {
        setStatusForNestedObjectFields(nestedAttribute, status, true);
      }
    }
  }
};

export const shareCredentialCardFromCredential = (
  credential: CredentialDetail | undefined,
  invalidLVVC: boolean,
  expanded: boolean,
  multipleCredentialsAvailable: boolean,
  request: PresentationDefinitionRequestedCredential,
  selectedFields: string[] | undefined,
  config: Config,
  testID?: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const selectiveDisclosureSupported = supportsSelectiveDisclosure(
    credential,
    config,
  );
  const notice =
    selectiveDisclosureSupported === false
      ? {
          notice: translate('proofRequest.selectiveDisclosure.notice'),
          noticeIcon: CredentialNoticeWarningIcon,
        }
      : undefined;
  const card = credential
    ? validityCheckedCardFromCredential(
        credential,
        invalidLVVC,
        expanded,
        multipleCredentialsAvailable,
        config,
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
    const disabled = !credential || !field || field.required;
    const attribute: CredentialAttribute = {
      ...shareCredentialCardAttributeFromClaim(id, claim, field, config),
      selected,
      testID: concatTestID(testID, 'claim', `${index}`),
    };

    setStatusForNestedObjectFields(attribute, status, disabled);
    return attribute;
  });
  return {
    attributes: nestAttributes(attributes),
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
          noticeIcon: CredentialNoticeWarningIcon,
        }
      : undefined;
  const { header, ...cardProps } = getCredentialCardPropsFromCredential(
    credential,
    credential.claims,
    config,
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
    const claim = spreadClaims(credential.claims).find(({ key }) => {
      return key === field.keyMap[credential.id];
    });

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
    attributes: nestAttributes(attributes),
    card,
  };
};
