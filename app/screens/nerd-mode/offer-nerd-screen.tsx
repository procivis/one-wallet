import {
  ActivityIndicator,
  NerdModeItemProps,
  NerdModeScreen,
  useCredentialDetail,
} from '@procivis/one-react-native-components';
import { TrustEntityRoleEnum } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { attributesLabels, entityLabels } from './utils';

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

  const nerdModeFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.credentialSchema'),
      highlightedText: credentialDetail.schema.name,
    },
    {
      attributeKey: translate('common.credentialFormat'),
      attributeText: credentialDetail.schema.format,
    },
    {
      attributeKey: translate('common.revocationMethod'),
      attributeText: credentialDetail.schema.revocationMethod,
    },
  ];

  return (
    <NerdModeScreen
      entityCluster={{
        entityLabels,
        identifier: credentialDetail.issuer,
        role: TrustEntityRoleEnum.ISSUER,
      }}
      labels={attributesLabels}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={[
        {
          data: nerdModeFields,
          title: translate('common.credentialOfferData'),
        },
      ]}
      testID="CredentialOffer.nerdView"
      title={translate('common.moreInformation')}
    />
  );
};

export default CredentialOfferNerdView;
