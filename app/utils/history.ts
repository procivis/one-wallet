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
  CoreConfig,
  CredentialDetail,
  CredentialRole,
  CredentialSchemaListItem,
  CredentialState,
  HistoryAction,
  HistoryEntityType,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import { Dimensions, View } from 'react-native';

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
    ...Object.keys(HistoryAction).map((key) => ({
      [key]: translate(`historyAction.${key as HistoryAction}`),
    })),
  ) as { [key in keyof typeof HistoryAction]: string },
  entityTypes: Object.assign(
    {},
    ...Object.keys(HistoryEntityType).map((key) => ({
      [key]: translate(`historyEntityType.${key as HistoryEntityType}`),
    })),
  ) as { [key in keyof typeof HistoryEntityType]: string },
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
      width: Dimensions.get('window').width - 32,
    },
  };
};

export const historyDeletedCredentialCardFromCredentialSchema = (
  credentialSchema: CredentialSchemaListItem,
  claims: Claim[],
  config: CoreConfig,
): Omit<CredentialDetailsCardProps, 'expanded'> => {
  const credential: CredentialDetail = {
    claims,
    createdDate: '',
    id: '',
    issuanceDate: '',
    lastModified: '',
    protocol: '',
    role: CredentialRole.HOLDER,
    schema: credentialSchema,
    state: CredentialState.ACCEPTED,
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
      width: Dimensions.get('window').width - 32,
    },
  };
};
