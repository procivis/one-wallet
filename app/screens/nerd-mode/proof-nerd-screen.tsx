import {
  ActivityIndicator,
  NerdModeItemProps,
  NerdModeScreen,
} from '@procivis/one-react-native-components';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import moment from 'moment';
import React, { FunctionComponent } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { useProofDetail } from '../../hooks/core/proofs';
import { translate } from '../../i18n';
import { ProcivisExchangeProtocol } from '../../models/proofs';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const isProcivisProtocol = (
  protocol: string,
): ProcivisExchangeProtocol | undefined => {
  return ProcivisExchangeProtocol[
    protocol as keyof typeof ProcivisExchangeProtocol
  ];
};

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

  const procivisExchangeProtocol = isProcivisProtocol(proofDetail.exchange);

  const nerdModeFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('credentialDetail.credential.exchange'),
      attributeText: isProcivisProtocol(
        (procivisExchangeProtocol &&
          translate(`proofRequest.exchange.${procivisExchangeProtocol}`)) ||
          proofDetail.exchange,
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
      labels={{
        collapse: translate('nerdView.action.collapseAttribute'),
        expand: translate('nerdView.action.expandAttribute'),
      }}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
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

export default ProofDetailNerdView;
