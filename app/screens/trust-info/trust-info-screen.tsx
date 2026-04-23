import { TrustInfoDetailsScreen } from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';

import wrpr from '../../../assets/ecosystem-assets/wallet-relying-party-registry/config.json';
import i18n from '../../i18n/i18n';
import { useStores } from '../../models';
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { trustInfoDetailsScreenLabels } from '../../utils/trust-info';

const TrustInfoScreen: FC = () => {
  const navigation = useNavigation<RootNavigationProp<'TrustInfo'>>();
  const route = useRoute<RootRouteProp<'TrustInfo'>>();
  const { trustInformation } = route.params;
  const {
    locale: { locale },
  } = useStores();
  const language = locale ?? i18n.defaultLocale ?? 'en';
  const countries = wrpr.walletRelyingPartyRegistry.contactCountries;

  return (
    <TrustInfoDetailsScreen
      countries={countries}
      labels={trustInfoDetailsScreenLabels()}
      language={language}
      onClose={navigation.goBack}
      testID={'TrustInfoDetailsScreen'}
      trustInformation={trustInformation}
    />
  );
};

export default TrustInfoScreen;
