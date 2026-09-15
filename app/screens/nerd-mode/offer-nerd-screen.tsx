import {
  ActivityIndicator,
  NerdModeItemProps,
  NerdModeScreen,
  useCredentialDetail,
  useCredentials,
  useCredentialTrustInformation,
  useOrganisationDetail,
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
import React, { FunctionComponent, useCallback } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { useCurrentLanguage } from '../../hooks/language';
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
  const language = useCurrentLanguage();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();
  const { data: orgDetail } = useOrganisationDetail();

  const { credentialIds } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialIds[0]);
  const { data: credentials } = useCredentials({
    ids: credentialIds,
  });
  const { data: trustInformation } = useCredentialTrustInformation(
    featureFlags?.ecosystemsEnabled &&
      credentialDetail?.trustInformation?.result ===
        TrustResolutionResult.TRUSTED
      ? credentialIds[0]
      : undefined,
  );

  const trustDetailsPressHandler = useCallback(
    (trustInformation: TrustInformationDetailInfo) => {
      if (!trustInformation) {
        return;
      }
      nav.navigate('TrustInfo', {
        result:
          credentialDetail?.trustInformation?.result ??
          TrustResolutionResult.UNKNOWN,
        trustInformation,
      });
    },
    [nav, credentialDetail],
  );

  if (!credentialDetail || !credentials) {
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
      attributeKey: translate('common.credentialFormats'),
      attributeText: credentials
        .map((c) => c.schema.formats[0].format)
        .join(', '),
      testID: 'credentialFormats',
    },
    {
      attributeKey: translate('common.allowsRevocation'),
      attributeText: credentialDetail.schema.allowRevocation
        ? translate('common.yes')
        : translate('common.no'),
      testID: 'revocationMethod',
    },
  ];

  return (
    <NerdModeScreen
      entityCluster={{
        translate: orgDetail?.configuration?.enforceEcosystemAsHolder === false,
        trustInfoLabels: trustInfoLabels(),
        trustInformation: credentialDetail.trustInformation,
        trustInformationDetail: trustInformation?.issuer,
      }}
      labels={attributesLabels}
      language={language}
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
