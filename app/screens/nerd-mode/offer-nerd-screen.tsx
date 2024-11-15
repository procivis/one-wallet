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
import React, { FunctionComponent } from 'react';

import { RevocationMethod } from '../../../e2e/utils/enums';
import { useCopyToClipboard } from '../../hooks/clipboard';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';

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

  const didSections = credentialDetail.issuerDid?.split(':') ?? [];
  const identifier = didSections.pop();
  const didMethod = didSections.join(':') + ':';

  const didField = identifier
    ? [
        {
          attributeKey: translate('credentialDetail.credential.issuerDid'),
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
      attributeText: translate(
        `credentialDetail.credential.revocation.${
          credentialDetail.schema.revocationMethod as RevocationMethod
        }`,
      ),
    },
  ];

  return (
    <NerdModeScreen
      entityCluster={{
        entityName:
          credentialDetail?.issuerDid ??
          translate('credentialOffer.unknownIssuer'),
      }}
      labels={{
        collapse: translate('nerdView.action.collapseAttribute'),
        expand: translate('nerdView.action.expandAttribute'),
      }}
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
