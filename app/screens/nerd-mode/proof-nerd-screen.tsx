import {
  ActivityIndicator,
  getCredentialSchemaWithoutImages,
  NerdModeItemProps,
  NerdModeScreen,
  useProofDetail,
} from '@procivis/one-react-native-components';
import { TrustEntityRoleEnum } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import moment from 'moment';
import React, { FunctionComponent } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { addElementIf } from '../../utils/array';
import { attributesLabels, entityLabels } from './utils';

const ProofDetailNerdView: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation<RootNavigationProp>();
  const route = useRoute<NerdModeRouteProp<'ProofNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();
  const { proofId } = route.params;
  const { data: proofDetail } = useProofDetail(proofId);

  if (!proofDetail) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const proofRequestFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.proofSchemaName'),
      highlightedText: proofDetail.proofSchema?.name,
    },
    {
      attributeKey: translate('common.exchangeProtocol'),
      attributeText: proofDetail.protocol,
    },
    {
      attributeKey: translate('common.createDate'),
      attributeText: moment(proofDetail?.createdDate).format(
        'DD.MM.YYYY, HH:mm',
      ),
    },
    {
      attributeKey: translate('common.proofschema'),
      attributeText: JSON.stringify(proofDetail.proofSchema),
    },
  ].filter((el) => Boolean(el?.highlightedText ?? el?.attributeText));

  const credentialsFields = proofDetail.proofInputs
    .map((proofInput) => [
      {
        attributeKey: translate('common.credentialSchemaName'),
        highlightedText: proofInput.credentialSchema.name,
      },
      {
        attributeKey: 'entityCluster',
        did: proofInput.credential?.issuer,
        entityLabels: entityLabels,
        role: TrustEntityRoleEnum.ISSUER,
        testID: `ProofRequestNerdView.issuerTrustEntity.${proofInput.credential?.id}`,
      },
      {
        attributeKey: translate('common.createDate'),
        attributeText: moment(proofInput.credential?.createdDate).format(
          'DD.MM.YYYY, HH:mm',
        ),
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
      {
        attributeKey: translate('common.storageType'),
        attributeText: proofInput.credentialSchema.walletStorageType,
        testID: 'storageType',
      },
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
    ])
    .flat(1);

  return (
    <NerdModeScreen
      entityCluster={{
        entityLabels: entityLabels,
        identifier: proofDetail.verifier,
        role: TrustEntityRoleEnum.VERIFIER,
        testID: 'ProofRequestNerdView.verifierTrustEntity',
      }}
      labels={attributesLabels}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
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
