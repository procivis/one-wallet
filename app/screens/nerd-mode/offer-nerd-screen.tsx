import {
  ActivityIndicator,
  NerdModeItemProps,
  NerdModeScreen,
  useCredentialDetail,
} from '@procivis/one-react-native-components';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { attributesLabels } from './utils';

const CredentialOfferNerdView: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation();
  const route = useRoute<NerdModeRouteProp<'OfferNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();
  const { credentialId } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialId);

  if (!credentialDetail) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const didId = credentialDetail.issuerDid?.did || '';
  const didSections = didId.split(':') ?? [];
  const identifier = didSections.pop();
  const didMethod = didSections.join(':') + ':';

  const didField = identifier
    ? [
        {
          attributeKey: translate('credentialDetail.credential.identifier'),
          attributeText: identifier,
          canBeCopied: true,
          highlightedText: didMethod,
        },
      ]
    : [];

  const [schemaField, ...nerdModeFields]: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('credentialDetail.credential.schema'),
      highlightedText: credentialDetail.schema.name,
    },
    {
      attributeKey: translate('credentialDetail.credential.format'),
      attributeText: credentialDetail.schema.format,
    },
    {
      attributeKey: translate('credentialDetail.credential.revocationMethod'),
      attributeText: credentialDetail.schema.revocationMethod,
    },
  ];

  return (
    <NerdModeScreen
      labels={attributesLabels}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={[
        {
          data: [schemaField, ...didField, ...nerdModeFields],
          title: translate('credentialOffer.nerdView.section.title'),
        },
      ]}
      testID="CredentialOffer.nerdView"
      title={translate('credentialDetail.action.moreInfo')}
    />
  );
};

export default CredentialOfferNerdView;
