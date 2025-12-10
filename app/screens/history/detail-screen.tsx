import {
  HistoryDetailsScreen,
  HistoryDetailsViewProps,
  useCoreConfig,
  useCredentialDetail,
  useCredentials,
  useProofDetail,
} from '@procivis/one-react-native-components';
import {
  Claim,
  HistoryActionEnum,
  HistoryEntityTypeEnum,
  ProofInputClaim,
  TrustEntityRoleEnum,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useMemo } from 'react';

import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  HistoryNavigationProp,
  HistoryRouteProp,
} from '../../navigators/history/history-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { nonEmptyFilter } from '../../utils/filtering';
import {
  historyDeletedCredentialCardFromCredentialSchema,
  historyDeletedCredentialCardWithName,
  historyListItemLabels,
  historyProofSchemaHeader,
} from '../../utils/history';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';

const claimFromProofInputClaim = (
  input: ProofInputClaim,
  parentPath?: string,
): Claim | undefined => {
  if (input.value === undefined) {
    return undefined;
  }

  const path = parentPath
    ? `${parentPath}/${input.schema.key}`
    : input.schema.key;

  const schema = {
    array: input.schema.array,
    claims: [],
    createdDate: '',
    datatype: input.schema.dataType,
    id: input.schema.id,
    key: input.schema.key,
    lastModified: '',
    required: input.schema.required,
  };

  if (Array.isArray(input.value)) {
    return {
      path,
      schema,
      value: input.value
        .map((v, index) => claimFromProofInputClaim(v, `${path}/${index}`))
        .filter(nonEmptyFilter),
    };
  }

  return {
    path,
    schema,
    value: input.value,
  };
};

export const HistoryDetailScreen: FC = () => {
  const navigation = useNavigation<HistoryNavigationProp<'Detail'>>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<HistoryRouteProp<'Detail'>>();
  const onImagePreview = useCredentialImagePreview();
  const { entry } = route.params;

  const { data: config } = useCoreConfig();
  const { data: issuedCredential } = useCredentialDetail(
    entry.entityType === HistoryEntityTypeEnum.CREDENTIAL
      ? entry.entityId
      : undefined,
  );
  const { data: proof } = useProofDetail(
    entry.entityType === HistoryEntityTypeEnum.PROOF
      ? entry.entityId
      : undefined,
  );
  const { data: credentials } = useCredentials({
    ids:
      proof?.proofInputs
        .map(({ credential }) => credential?.id)
        ?.filter(nonEmptyFilter) ?? [],
  });

  const onInfoPressed = useMemo(() => {
    if (
      entry.entityType === HistoryEntityTypeEnum.BACKUP ||
      (entry.entityType === HistoryEntityTypeEnum.PROOF && !proof) ||
      (entry.entityType === HistoryEntityTypeEnum.CREDENTIAL &&
        !issuedCredential)
    ) {
      return undefined;
    }

    const infoPressHandler = () => {
      if (entry.entityType === HistoryEntityTypeEnum.PROOF) {
        rootNavigation.navigate('NerdMode', {
          params: {
            proofId: entry.entityId!,
          },
          screen: 'ProofNerdMode',
        });
      } else if (entry.entityType === HistoryEntityTypeEnum.CREDENTIAL) {
        const credentialActions = [
          HistoryActionEnum.SUSPENDED,
          HistoryActionEnum.REVOKED,
          HistoryActionEnum.DEACTIVATED,
        ];
        if (credentialActions.includes(entry.action)) {
          rootNavigation.navigate('NerdMode', {
            params: {
              credentialId: entry.entityId!,
            },
            screen: 'CredentialNerdMode',
          });
        } else {
          rootNavigation.navigate('NerdMode', {
            params: {
              credentialId: entry.entityId!,
            },
            screen: 'OfferNerdMode',
          });
        }
      }
    };

    return infoPressHandler;
  }, [entry, issuedCredential, proof, rootNavigation]);

  const dataHeader: HistoryDetailsViewProps['data']['header'] = useMemo(() => {
    if (
      entry.entityType === HistoryEntityTypeEnum.CREDENTIAL &&
      issuedCredential?.issuer
    ) {
      return {
        entity: {
          identifier: issuedCredential?.issuer ?? entry.target,
          labels: trustEntityDetailsLabels(TrustEntityRoleEnum.ISSUER),
          role: TrustEntityRoleEnum.ISSUER,
          testID: 'EntityDetail',
        },
      };
    } else if (
      entry.entityType === HistoryEntityTypeEnum.PROOF &&
      proof?.verifier
    ) {
      return {
        entity: {
          identifier: proof?.verifier ?? entry.target,
          labels: trustEntityDetailsLabels(TrustEntityRoleEnum.VERIFIER),
          role: TrustEntityRoleEnum.VERIFIER,
          testID: 'EntityDetail',
        },
      };
    } else if (entry.name) {
      return {
        credentialHeader: historyProofSchemaHeader(entry.entityId, entry.name),
      };
    }
  }, [
    entry.entityId,
    entry.entityType,
    entry.name,
    entry.target,
    issuedCredential?.issuer,
    proof?.verifier,
  ]);

  const assets: HistoryDetailsViewProps['assets'] = useMemo(() => {
    if (entry.entityType === HistoryEntityTypeEnum.CREDENTIAL) {
      if (!issuedCredential) {
        return {
          cards: [
            {
              credentialCard: historyDeletedCredentialCardWithName(
                entry.name,
                entry.entityId ?? '0',
              ),
            },
          ],
        };
      }
      return {
        cards: [
          {
            credentialDetails: {
              credentialId: issuedCredential.id,
            },
          },
        ],
      };
    } else if (entry.entityType === HistoryEntityTypeEnum.PROOF) {
      if (!proof?.proofInputs?.length) {
        return undefined;
      }
      return {
        cards: proof.proofInputs.map(
          ({ claims, credential, credentialSchema }) => {
            if (
              !credential ||
              !credentials?.find((c) => c.id === credential.id)
            ) {
              return {
                credentialCard:
                  historyDeletedCredentialCardFromCredentialSchema(
                    credentialSchema,
                    claims
                      .map((c) => claimFromProofInputClaim(c))
                      .filter(nonEmptyFilter),
                    config!,
                  ),
              };
            }
            return {
              credentialDetails: {
                claims: claims
                  .map((c) => claimFromProofInputClaim(c))
                  .filter(nonEmptyFilter),
                credentialId: credential.id,
              },
            };
          },
        ),
      };
    }
  }, [
    config,
    credentials,
    entry.entityId,
    entry.entityType,
    entry.name,
    issuedCredential,
    proof,
  ]);

  return (
    <HistoryDetailsScreen
      assets={assets}
      dataHeader={dataHeader}
      item={entry}
      labels={{
        credentialCard: credentialCardLabels(),
        data: {
          action: translate('common.action'),
          date: translate('common.date'),
        },
        infoButtonAccessibility: translate('common.info'),
        item: historyListItemLabels(),
        relatedAssets: translate('common.relatedAssets'),
        title: translate(`historyEntityType.${entry.entityType}`),
      }}
      onBackPressed={navigation.goBack}
      onImagePreview={onImagePreview}
      onInfoPressed={onInfoPressed}
    />
  );
};
