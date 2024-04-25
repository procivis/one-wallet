import { ActivityIndicator } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { FunctionComponent } from 'react';

import { Transport } from '../../../e2e/utils/enums';
import { NerdModeItemProps } from '../../components/nerd-view/nerd-mode-item';
import NerdModeScreen from '../../components/screens/nerd-mode-screen';
import { useProofDetail } from '../../hooks/core/proofs';
import { translate } from '../../i18n';
import {
  ShareCredentialNavigationProp,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';

const ProofRequestNerdView: FunctionComponent = () => {
  const nav =
    useNavigation<ShareCredentialNavigationProp<'ProofRequestNerdScreen'>>();

  const route = useRoute<ShareCredentialRouteProp<'ProofRequestNerdScreen'>>();

  const { proofId } = route.params;

  const { data: proofDetail } = useProofDetail(proofId);

  if (!proofDetail) {
    return <ActivityIndicator />;
  }

  const didSections = proofDetail.verifierDid?.split(':') ?? [];
  const identifier = didSections.pop();
  const didMethod = didSections.join(':') + ':';

  const didField = identifier
    ? [
        {
          attributeKey: translate('proofRequest.verifierDid'),
          attributeText: identifier,
          canBeCopied: true,
          highlightedText: didMethod,
        },
      ]
    : [];

  const nerdModeFields: Array<NerdModeItemProps> = [
    {
      attributeKey: translate('credentialDetail.credential.transport'),
      attributeText: translate(
        `proofRequest.transport.${proofDetail?.transport as Transport}`,
      ),
    },
    {
      attributeKey: translate('proofRequest.createDate'),
      attributeText: moment(proofDetail?.createdDate).format(
        'DD.MM.YYYY, HH:mm',
      ),
    },
    {
      attributeKey: translate('proofRequest.requestDate'),
      attributeText: moment().format('DD.MM.YYYY, HH:mm'),
    },
  ];

  return (
    <NerdModeScreen
      entityCluster={{
        entityName:
          proofDetail?.verifierDid ?? translate('proofRequest.unknownVerifier'),
      }}
      onClose={nav.goBack}
      sections={[
        {
          data: [...didField, ...nerdModeFields],
          title: translate('proofRequest.nerdView.section.title'),
        },
      ]}
      testID="ProofRequest.nerdView"
      title={translate('credentialDetail.action.moreInfo')}
    />
  );
};

export default ProofRequestNerdView;
