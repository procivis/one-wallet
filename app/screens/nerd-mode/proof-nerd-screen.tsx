import {
  ActivityIndicator,
  addElementIf,
  getCredentialSchemaWithoutImages,
  NerdModeItemProps,
  NerdModeScreen,
  nonEmptyFilter,
  useCredentialsTrustInformation,
  useOrganisationDetail,
  useProofDetail,
  useProofRequestTrustInformation,
} from '@procivis/one-react-native-components';
import {
  TrustInformationDetailInfo,
  TrustResolutionResult,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import moment from 'moment';
import React, { FunctionComponent, useCallback } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { trustInfoLabels } from '../../utils/trust-info';
import { attributesLabels } from './utils';

const ProofDetailNerdView: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation<RootNavigationProp>();
  const route = useRoute<NerdModeRouteProp<'ProofNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();
  const language = useCurrentLanguage();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();
  const { data: orgDetail } = useOrganisationDetail();

  const { proofId } = route.params;
  const { data: proofDetail } = useProofDetail(proofId);
  const { data: trustInformation } = useProofRequestTrustInformation(
    featureFlags?.ecosystemsEnabled ? proofId : undefined,
  );
  const credentialIDs =
    proofDetail?.proofInputs
      .map((input) => input.credential?.id)
      .filter(nonEmptyFilter) ?? [];
  const credentialsTrustInformation = useCredentialsTrustInformation(
    featureFlags?.ecosystemsEnabled ? credentialIDs : [],
  );

  const trustDetailsPressHandler = useCallback(
    (trustInformation: TrustInformationDetailInfo) => {
      if (!trustInformation) {
        return;
      }
      nav.navigate('TrustInfo', {
        result:
          proofDetail?.trustInformation?.result ??
          TrustResolutionResult.UNKNOWN,
        trustInformation,
      });
    },
    [nav, proofDetail],
  );

  if (!proofDetail) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const proofRequestFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.proofSchemaName'),
      highlightedText: proofDetail.proofSchema?.name,
      testID: 'proofSchemaName',
    },
    {
      attributeKey: translate('common.exchangeProtocol'),
      attributeText: proofDetail.protocol,
      testID: 'exchangeProtocol',
    },
    {
      attributeKey: translate('common.createDate'),
      attributeText: moment(proofDetail?.createdDate).format(
        'DD.MM.YYYY, HH:mm',
      ),
      testID: 'createdDate',
    },
    {
      attributeKey: translate('common.proofschema'),
      attributeText: JSON.stringify(proofDetail.proofSchema),
      testID: 'proofSchema',
    },
  ].filter((el) => Boolean(el?.highlightedText ?? el?.attributeText));

  const credentialsFields = proofDetail.proofInputs
    .map((proofInput) => {
      const credentialId = proofInput.credential?.id;
      const trustInformation = credentialId
        ? credentialsTrustInformation[credentialIDs.indexOf(credentialId)]?.data
        : undefined;
      return [
        {
          attributeKey: translate('common.credentialSchemaName'),
          highlightedText: proofInput.credentialSchema.name,
          testID: 'credentialSchemaName',
        },
        {
          attributeKey: 'entityCluster',
          identifier: proofInput.credential?.issuer,
          testID: `issuerTrustEntity.${proofInput.credential?.id}`,
          trustInfoLabels: trustInfoLabels(),
          trustInformation,
        },
        {
          attributeKey: translate('common.createDate'),
          attributeText: moment(proofInput.credential?.createdDate).format(
            'DD.MM.YYYY, HH:mm',
          ),
          testID: 'createdDate',
        },
        {
          attributeKey: translate('common.credentialFormat'),
          attributeText: proofInput.credentialSchema.format,
          testID: 'credentialFormat',
        },
        {
          attributeKey: translate('common.documentType'),
          attributeText: proofInput.credentialSchema.schemaId,
          testID: 'documentType',
        },
        ...addElementIf(
          Boolean(proofInput.credentialSchema.keyStorageSecurity),
          {
            attributeKey: translate('common.storageType'),
            attributeText:
              proofInput.credentialSchema.keyStorageSecurity ?? 'UNKNOWN',
            testID: 'storageType',
          },
        ),
        {
          attributeKey: translate('common.credentialSchema'),
          attributeText: JSON.stringify(
            getCredentialSchemaWithoutImages({
              ...proofInput.credentialSchema,
              formats: [
                {
                  ecosystemSchemaId: proofInput.credentialSchema.schemaId,
                  format: proofInput.credentialSchema.format,
                },
              ],
              walletAttestation: {
                keyStorageSecurityLevel:
                  proofInput.credentialSchema.keyStorageSecurity,
                requireInstanceAttestation:
                  proofInput.credentialSchema.requiresWalletInstanceAttestation,
              },
            }),
            null,
            1,
          ),
          canBeCopied: true,
          testID: 'schema',
        },
      ];
    })
    .flat(1);

  return (
    <NerdModeScreen
      entityCluster={{
        testID: 'ProofRequestNerdView.verifierTrustEntity',
        translate: orgDetail?.configuration?.enforceEcosystemAsHolder === false,
        trustInfoLabels: trustInfoLabels(),
        trustInformation: proofDetail.trustInformation,
        trustInformationDetail: trustInformation?.verifier,
      }}
      labels={attributesLabels}
      language={language}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      onOpenTrustInfoDetails={trustDetailsPressHandler}
      sections={[
        {
          data: proofRequestFields,
          title: translate('common.proofRequest'),
        },
        ...addElementIf(Boolean(proofDetail.proofInputs.length), {
          data: credentialsFields,
          title: translate('common.credential(s)'),
        }),
      ]}
      testID="ProofRequestNerdView"
      title={translate('common.moreInformation')}
    />
  );
};

export default ProofDetailNerdView;
