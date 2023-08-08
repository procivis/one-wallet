import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect } from 'react';
import ONE, { OneError, OneErrorCode } from 'react-native-one-core';

import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const PinCodeSetScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();

  const onClose = useCallback(() => {
    rootNavigation.replace('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  // create base local identifiers in the wallet
  useEffect(() => {
    const localOrganisationId = '11111111-2222-3333-a444-ffffffffffff';
    ONE.createOrganisation(localOrganisationId)
      .catch((err) => {
        if (err instanceof OneError && err.code === OneErrorCode.AlreadyExists) {
          return;
        }
        throw err;
      })
      .then(() => ONE.createLocalDid(`did:key:${Math.floor(Math.random() * 10000000)}`, localOrganisationId))
      .catch((err) => {
        reportException(err, 'Failed to create base identifiers');
      });
  }, []);

  useBlockOSBackNavigation();

  return (
    <LoadingResult
      testID="PinCodeSetScreen"
      variation={LoadingResultVariation.Neutral}
      title={translate('onboarding.pinCodeSet.title')}
      subtitle={translate('onboarding.pinCodeSet.description')}
      state={LoadingResultState.Success}
      inProgressCloseButtonLabel={translate('common.close')}
      successCloseButtonLabel={translate('common.continue')}
      failureCloseButtonLabel={translate('common.close')}
      onClose={onClose}
    />
  );
};

export default PinCodeSetScreen;
