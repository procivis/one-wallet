import {
  HistoryDetailsScreen,
  HistoryDetailsViewProps,
  useCoreConfig,
  useCredentialDetail,
  useCredentials,
  useProofDetail,
} from '@procivis/one-react-native-components';
import {
  ClaimBindingDto,
  HistoryActionBindingEnum,
  HistoryEntityTypeBindingEnum,
  ProofRequestClaimBindingDto,
  TrustEntityRoleBindingEnum,
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
  input: ProofRequestClaimBindingDto,
  parentPath?: string,
): ClaimBindingDto | undefined => {
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

  if (input.value.type_ === 'CLAIMS') {
    return {
      path,
      schema,
      value: {
        type_: 'NESTED',
        value: input.value.value
          .map((v, index) => claimFromProofInputClaim(v, `${path}/${index}`))
          .filter(nonEmptyFilter),
      },
    };
  }

  return {
    path,
    schema,
    value: { type_: 'STRING', value: input.value.value },
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
    entry.entityType === HistoryEntityTypeBindingEnum.CREDENTIAL
      ? entry.entityId
      : undefined,
  );
  const { data: proof } = useProofDetail(
    entry.entityType === HistoryEntityTypeBindingEnum.PROOF
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
      entry.entityType === HistoryEntityTypeBindingEnum.BACKUP ||
      (entry.entityType === HistoryEntityTypeBindingEnum.PROOF && !proof) ||
      (entry.entityType === HistoryEntityTypeBindingEnum.CREDENTIAL &&
        !issuedCredential)
    ) {
      return undefined;
    }

    const infoPressHandler = () => {
      if (entry.entityType === HistoryEntityTypeBindingEnum.PROOF) {
        rootNavigation.navigate('NerdMode', {
          params: {
            proofId: entry.entityId!,
          },
          screen: 'ProofNerdMode',
        });
      } else if (entry.entityType === HistoryEntityTypeBindingEnum.CREDENTIAL) {
        const credentialActions = [
          HistoryActionBindingEnum.SUSPENDED,
          HistoryActionBindingEnum.REVOKED,
          HistoryActionBindingEnum.DEACTIVATED,
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
      entry.entityType === HistoryEntityTypeBindingEnum.CREDENTIAL &&
      issuedCredential?.issuer
    ) {
      return {
        entity: {
          identifier: issuedCredential?.issuer ?? entry.target,
          labels: trustEntityDetailsLabels(TrustEntityRoleBindingEnum.ISSUER),
          role: TrustEntityRoleBindingEnum.ISSUER,
          testID: 'EntityDetail',
        },
      };
    } else if (
      entry.entityType === HistoryEntityTypeBindingEnum.PROOF &&
      proof?.verifier
    ) {
      return {
        entity: {
          identifier: proof?.verifier ?? entry.target,
          labels: trustEntityDetailsLabels(TrustEntityRoleBindingEnum.VERIFIER),
          role: TrustEntityRoleBindingEnum.VERIFIER,
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
    if (entry.entityType === HistoryEntityTypeBindingEnum.CREDENTIAL) {
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
    } else if (entry.entityType === HistoryEntityTypeBindingEnum.PROOF) {
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
