import {
  concatTestID,
  CredentialDetailsCardProps,
  CredentialHeaderProps,
  detailsCardFromCredential,
  HistoryListItemLabels,
  HistoryStatusDeleteIcon,
} from '@procivis/one-react-native-components';
import {
  Claim,
  Config,
  CredentialDetail,
  CredentialRoleEnum,
  CredentialSchema,
  CredentialStateEnum,
  HistoryActionEnum,
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import { View } from 'react-native';

import { translate } from '../i18n';
import { credentialCardLabels } from './credential';
import { hashString } from './string';

const LOGO_COLORS = [
  '#b4c1f4',
  '#dac2ae',
  '#feada5',
  '#e2bb8c',
  '#f9a867',
  '#ebb1f9',
  '#becfe8',
  '#e9c2ea',
  '#7ecdcc',
];

export const schemaColorForName = (proofSchemaName: string) => {
  const colorIndex = hashString(proofSchemaName) % LOGO_COLORS.length;
  const color = LOGO_COLORS[colorIndex];
  return color;
};

export const getEntryTitle = (entry: HistoryListItem) => {
  const entityType = translate(`historyEntityType.${entry.entityType}`);
  const action = translate(`historyAction.${entry.action}`);
  return `${entityType} ${action}`;
};

export const historyListItemLabels: () => HistoryListItemLabels = () => ({
  actions: Object.assign(
    {},
    ...Object.keys(HistoryActionEnum).map((key) => ({
      [key]: translate(`historyAction.${key as HistoryActionEnum}`),
    })),
  ) as { [key in keyof typeof HistoryActionEnum]: string },
  entityTypes: Object.assign(
    {},
    ...Object.keys(HistoryEntityTypeEnum).map((key) => ({
      [key]: translate(`historyEntityType.${key as HistoryEntityTypeEnum}`),
    })),
  ) as { [key in keyof typeof HistoryEntityTypeEnum]: string },
});

export const historyProofSchemaHeader = (
  proofSchemaId: string | undefined,
  proofSchemaName: string,
): CredentialHeaderProps & {
  onPressed?: () => void;
} => {
  const color = schemaColorForName(proofSchemaName);
  return {
    color,
    credentialName: proofSchemaName,
    testID: concatTestID('ProofSchemaHeader', proofSchemaId),
  };
};

export const historyDeletedCredentialCardWithName = (
  credentialSchemaName: string,
  credentialId: string,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  return {
    attributes: false,
    card: {
      credentialId: credentialId,
      header: {
        accessory: View,
        credentialDetailErrorColor: true,
        credentialDetailPrimary: translate('common.deleted'),
        credentialName: credentialSchemaName,
        statusIcon: HistoryStatusDeleteIcon,
        testID: concatTestID('DeletedCredential', credentialId),
      },
      testID: concatTestID('DeletedCredentialCard', credentialId),
    },
  };
};

export const historyDeletedCredentialCardFromCredentialSchema = (
  credentialSchema: CredentialSchema,
  claims: Claim[],
  config: Config,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const credential: CredentialDetail = {
    claims,
    createdDate: '',
    id: '',
    issuanceDate: '',
    lastModified: '',
    protocol: '',
    role: CredentialRoleEnum.HOLDER,
    schema: credentialSchema,
    state: CredentialStateEnum.ACCEPTED,
  };
  const props = detailsCardFromCredential(
    credential,
    config,
    concatTestID('CredentialSchemaCard', credentialSchema.id),
    credentialCardLabels(),
  );
  return {
    ...props,
    card: {
      ...props.card,
      header: {
        ...props.card.header,
        credentialDetailErrorColor: true,
        credentialDetailPrimary: translate('common.deleted'),
        credentialDetailTestID: concatTestID(
          'DeletedCredential',
          credentialSchema.id,
        ),
        statusIcon: HistoryStatusDeleteIcon,
      },
    },
  };
};
