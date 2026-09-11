import {
  HistoryDetailsScreen,
  HistoryDetailsViewProps,
  useCoreConfig,
  useCredentialDetail,
  useCredentials,
  useOrganisationDetail,
  useProofDetail,
  useProofRequestTrustInformation,
} from '@procivis/one-react-native-components';
import {
  Claim,
  HistoryAction,
  HistoryEntityType,
  ProofClaim,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useMemo } from 'react';

import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import { useStores } from '../../models';
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
import { trustInfoLabels } from '../../utils/trust-info';

const claimFromProofInputClaim = (
  input: ProofClaim,
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
    translations: { name: {} },
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
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();
  const language = useCurrentLanguage();

  const { data: config } = useCoreConfig();
  const { data: orgDetail } = useOrganisationDetail();
  const { data: issuedCredential } = useCredentialDetail(
    entry.entityType === HistoryEntityType.CREDENTIAL
      ? entry.entityId
      : undefined,
  );
  const { data: credentialTrustInformation } = useProofRequestTrustInformation(
    featureFlags?.ecosystemsEnabled &&
      entry.entityType === HistoryEntityType.CREDENTIAL
      ? entry.entityId
      : undefined,
  );
  const { data: proof } = useProofDetail(
    entry.entityType === HistoryEntityType.PROOF ? entry.entityId : undefined,
  );
  const { data: proofTrustInformation } = useProofRequestTrustInformation(
    featureFlags?.ecosystemsEnabled &&
      entry.entityType === HistoryEntityType.PROOF
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
      entry.entityType === HistoryEntityType.BACKUP ||
      (entry.entityType === HistoryEntityType.PROOF && !proof) ||
      (entry.entityType === HistoryEntityType.CREDENTIAL && !issuedCredential)
    ) {
      return undefined;
    }

    const infoPressHandler = () => {
      if (entry.entityType === HistoryEntityType.PROOF) {
        rootNavigation.navigate('NerdMode', {
          params: {
            proofId: entry.entityId!,
          },
          screen: 'ProofNerdMode',
        });
      } else if (entry.entityType === HistoryEntityType.CREDENTIAL) {
        const credentialActions = [
          HistoryAction.SUSPENDED,
          HistoryAction.REVOKED,
          HistoryAction.DEACTIVATED,
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
              credentialIds: [entry.entityId!],
            },
            screen: 'OfferNerdMode',
          });
        }
      }
    };

    return infoPressHandler;
  }, [entry, issuedCredential, proof, rootNavigation]);

  const dataHeader: HistoryDetailsViewProps['data']['header'] = useMemo(() => {
    if (featureFlags?.ecosystemsEnabled) {
      if (
        entry.entityType === HistoryEntityType.CREDENTIAL &&
        issuedCredential
      ) {
        return {
          entity: {
            labels: trustInfoLabels(),
            language,
            testID: 'EntityDetail',
            translate:
              orgDetail?.configuration?.enforceEcosystemAsHolder === false,
            trustInformation:
              issuedCredential.trustInformation && credentialTrustInformation
                ? {
                    ...issuedCredential.trustInformation,
                    identifier:
                      credentialTrustInformation.issuer?.value[0]?.identifier,
                  }
                : undefined,
          },
        } satisfies HistoryDetailsViewProps['data']['header'];
      }
      if (entry.entityType === HistoryEntityType.PROOF && proof) {
        return {
          entity: {
            labels: trustInfoLabels(),
            language,
            testID: 'EntityDetail',
            translate:
              orgDetail?.configuration?.enforceEcosystemAsHolder === false,
            trustInformation:
              proof.trustInformation && proofTrustInformation
                ? {
                    ...proof.trustInformation,
                    identifier:
                      proofTrustInformation.issuer?.value[0]?.identifier,
                  }
                : undefined,
          },
        } satisfies HistoryDetailsViewProps['data']['header'];
      }
    }
    if (entry.name) {
      return {
        credentialHeader: historyProofSchemaHeader(entry.entityId, entry.name),
      } satisfies HistoryDetailsViewProps['data']['header'];
    }
  }, [
    featureFlags?.ecosystemsEnabled,
    entry.name,
    entry.entityType,
    entry.entityId,
    issuedCredential,
    proof,
    language,
    orgDetail?.configuration?.enforceEcosystemAsHolder,
    credentialTrustInformation,
    proofTrustInformation,
  ]);

  const assets: HistoryDetailsViewProps['assets'] = useMemo(() => {
    if (entry.entityType === HistoryEntityType.CREDENTIAL) {
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
    } else if (entry.entityType === HistoryEntityType.PROOF) {
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
                    {
                      ...credentialSchema,
                      formats: [
                        {
                          ecosystemSchemaId: credentialSchema.schemaId,
                          format: credentialSchema.format,
                        },
                      ],
                    },
                    claims
                      .map((c) => claimFromProofInputClaim(c))
                      .filter(nonEmptyFilter),
                    config!,
                    language,
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
    language,
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
