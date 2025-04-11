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
  ClaimValue,
  DataTypeEnum,
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
  historyCardHeaderFromName,
  historyDeletedCredentialCardFromCredentialSchema,
  historyDeletedCredentialCardWithName,
  historyListItemLabels,
} from '../../utils/history';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';

const claimFromProofInputClaim = (
  input: ProofInputClaim,
): Claim | undefined => {
  const value = claimValueFromProofInputClaim(input);
  if (!value) {
    return undefined;
  }
  return {
    ...value,
    id: input.schema.id,
    key: input.schema.key,
  };
};

const claimValueFromProofInputClaim = ({
  schema,
  value,
}: ProofInputClaim): ClaimValue | undefined => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const values = value.map(claimFromProofInputClaim).filter(nonEmptyFilter);
    return schema.dataType === (DataTypeEnum.Object as string)
      ? {
          array: schema.array,
          dataType: DataTypeEnum.Object,
          value: values,
        }
      : {
          array: true,
          dataType: schema.dataType,
          value: values,
        };
  }

  return {
    array: false,
    dataType: schema.dataType,
    value,
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
    if (entry.entityType === HistoryEntityTypeEnum.BACKUP) {
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
  }, [entry, rootNavigation]);

  const dataHeader: HistoryDetailsViewProps['data']['header'] = useMemo(() => {
    if (
      entry.entityType === HistoryEntityTypeEnum.CREDENTIAL &&
      issuedCredential?.issuerDid
    ) {
      return {
        entity: {
          did: issuedCredential?.issuerDid ?? entry.target,
          labels: trustEntityDetailsLabels(TrustEntityRoleEnum.ISSUER),
          role: TrustEntityRoleEnum.ISSUER,
          testID: 'EntityDetail',
        },
      };
    } else if (
      entry.entityType === HistoryEntityTypeEnum.PROOF &&
      proof?.verifierDid
    ) {
      return {
        entity: {
          did: proof?.verifierDid ?? entry.target,
          labels: trustEntityDetailsLabels(TrustEntityRoleEnum.VERIFIER),
          role: TrustEntityRoleEnum.VERIFIER,
          testID: 'EntityDetail',
        },
      };
    } else if (entry.name) {
      return {
        credentialHeader: historyCardHeaderFromName(entry.name, 'SchemaHeader'),
      };
    }
  }, [
    entry.entityType,
    entry.name,
    entry.target,
    issuedCredential?.issuerDid,
    proof?.verifierDid,
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
      if (!proof || !proof.proofInputs?.length) {
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
                    claims.map(claimFromProofInputClaim).filter(nonEmptyFilter),
                    config!,
                  ),
              };
            }
            return {
              credentialDetails: {
                claims: claims
                  .map(claimFromProofInputClaim)
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
          action: translate('historyDetail.action'),
          date: translate('historyDetail.date'),
        },
        infoButtonAccessibility: translate('accessibility.nav.info'),
        item: historyListItemLabels(),
        relatedAssets: translate('historyDetail.relatedAssets'),
        title: translate(`history.entityType.${entry.entityType}`),
      }}
      onBackPressed={navigation.goBack}
      onImagePreview={onImagePreview}
      onInfoPressed={onInfoPressed}
    />
  );
};
