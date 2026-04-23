import {
  ActivityIndicator,
  addElementIf,
  getCredentialSchemaWithoutImages,
  NerdModeItemProps,
  NerdModeScreen,
  nonEmptyFilter,
  useCredentialsTrustInformation,
  useProofDetail,
  useProofRequestTrustInformation,
} from '@procivis/one-react-native-components';
import {
  TrustEntityRole,
  TrustInformationDetail,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import moment from 'moment';
import React, { FunctionComponent, useCallback } from 'react';

import { config as appConfig } from '../../config';
import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { trustInfoLabels } from '../../utils/trust-info';
import { attributesLabels, entityLabels } from './utils';

const ProofDetailNerdView: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation<RootNavigationProp>();
  const route = useRoute<NerdModeRouteProp<'ProofNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();
  const { proofId } = route.params;
  const { data: proofDetail } = useProofDetail(proofId);
  const { data: trustInformation } = useProofRequestTrustInformation(
    appConfig.featureFlags.legacyTrustManagementEnabled ? undefined : proofId,
  );
  const credentialIDs =
    proofDetail?.proofInputs
      .map((input) => input.credential?.id)
      .filter(nonEmptyFilter) ?? [];
  const credentialsTrustInformation = useCredentialsTrustInformation(
    appConfig.featureFlags.legacyTrustManagementEnabled ? [] : credentialIDs,
  );

  const trustDetailsPressHandler = useCallback(
    (trustInformation: TrustInformationDetail) => {
      if (!trustInformation) {
        return;
      }
      nav.navigate('TrustInfo', {
        trustInformation,
      });
    },
    [nav],
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
      const trustInformationIndex = credentialId
        ? credentialIDs.indexOf(credentialId)
        : undefined;
      const trustInformation = trustInformationIndex
        ? credentialsTrustInformation[trustInformationIndex].data
        : undefined;
      return [
        {
          attributeKey: translate('common.credentialSchemaName'),
          highlightedText: proofInput.credentialSchema.name,
          testID: 'credentialSchemaName',
        },
        {
          attributeKey: 'entityCluster',
          entityLabels: entityLabels,
          identifier: proofInput.credential?.issuer,
          legacyTrustManagementEnabled:
            appConfig.featureFlags.legacyTrustManagementEnabled,
          role: TrustEntityRole.ISSUER,
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
        {
          attributeKey: translate('common.revocationMethod'),
          attributeText: proofInput.credentialSchema.revocationMethod,
          testID: 'revocationMethod',
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
            getCredentialSchemaWithoutImages(proofInput.credentialSchema),
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
        entityLabels: entityLabels,
        identifier: proofDetail.verifier,
        legacyTrustManagementEnabled:
          appConfig.featureFlags.legacyTrustManagementEnabled,
        role: TrustEntityRole.VERIFIER,
        testID: 'ProofRequestNerdView.verifierTrustEntity',
        trustInfoLabels: trustInfoLabels(),
        trustInformation,
      }}
      labels={attributesLabels}
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
          title: translate('common.credentials'),
        }),
      ]}
      testID="ProofRequestNerdView"
      title={translate('common.moreInformation')}
    />
  );
};

export default ProofDetailNerdView;
