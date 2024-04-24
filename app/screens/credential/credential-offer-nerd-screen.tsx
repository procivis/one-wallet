import { ActivityIndicator } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import { RevocationMethod } from '../../../e2e/utils/enums';
import { NerdModeItemProps } from '../../components/nerd-view/nerd-mode-item';
import NerdModeScreen from '../../components/screens/nerd-mode-screen';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';

const CredentialOfferNerdView: FunctionComponent = () => {
  const nav =
    useNavigation<IssueCredentialNavigationProp<'CredentialOfferNerdScreen'>>();

  const route =
    useRoute<IssueCredentialRouteProp<'CredentialOfferNerdScreen'>>();

  const { credentialId } = route.params;

  const { data: credentialDetail } = useCredentialDetail(credentialId);

  if (!credentialDetail) {
    return <ActivityIndicator />;
  }

  const nerdModeFields: Array<NerdModeItemProps> = [
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
      onClose={nav.goBack}
      sections={[
        {
          data: nerdModeFields,
          title: translate('credentialOffer.nerdView.section.title'),
        },
      ]}
      testID="CredentialOffer.nerdView"
      title={translate('credentialDetail.action.moreInfo')}
    />
  );
};

export default CredentialOfferNerdView;
