import {
  ActivityIndicator,
  NerdModeItemProps,
  NerdModeScreen,
  useCredentialDetail,
  useCredentialTrustInformation,
} from '@procivis/one-react-native-components';
import { TrustInformationDetail } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { trustInfoLabels } from '../../utils/trust-info';
import { attributesLabels } from './utils';

const CredentialOfferNerdView: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation();
  const route = useRoute<NerdModeRouteProp<'OfferNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();

  const { credentialId } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialId);
  const { data: trustInformation } = useCredentialTrustInformation(
    featureFlags?.trustEcosystemsEnabled ? credentialId : undefined,
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

  if (!credentialDetail) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const nerdModeFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.credentialSchema'),
      highlightedText: credentialDetail.schema.name,
      testID: 'schemaName',
    },
    {
      attributeKey: translate('common.credentialFormat'),
      attributeText: credentialDetail.schema.format,
      testID: 'credentialFormat',
    },
    {
      attributeKey: translate('common.revocationMethod'),
      attributeText: credentialDetail.schema.revocationMethod,
      testID: 'credentialFormat',
    },
  ];

  console.log('trustInformation', trustInformation);
  return (
    <NerdModeScreen
      entityCluster={{
        identifier: credentialDetail.issuer,
        trustInfoLabels: trustInfoLabels(),
        trustInformation,
      }}
      labels={attributesLabels}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      onOpenTrustInfoDetails={trustDetailsPressHandler}
      sections={[
        {
          data: nerdModeFields,
          title: translate('common.credentialOfferData'),
        },
      ]}
      testID="CredentialOfferNerdView"
      title={translate('common.moreInformation')}
    />
  );
};

export default CredentialOfferNerdView;
