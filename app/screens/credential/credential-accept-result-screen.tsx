import {
  ButtonType,
  LoaderViewState,
  reportException,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Linking, Platform } from 'react-native';

import { ProcessingView } from '../../components/common/processing-view';
import { translate, translateError } from '../../i18n';
import { IssueCredentialRouteProp } from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { isRSELockedError } from '../../utils/rse';

const CredentialAcceptResultScreen: FunctionComponent = observer(() => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialManagement'>>();
  const route = useRoute<IssueCredentialRouteProp<'Result'>>();
  const { error, redirectUri } = route.params;

  const state = useMemo(() => {
    if (!error) {
      return LoaderViewState.Success;
    }
    if (isRSELockedError(error)) {
      return LoaderViewState.Error;
    }
    return LoaderViewState.Warning;
  }, [error]);

  const loaderLabel = useMemo(() => {
    if (error && isRSELockedError(error)) {
      return translate('info.credentialOffer.process.error.rseLocked.title');
    }
    return translateError(error, translate(`credentialOfferTitle.${state}`));
  }, [error, state]);

  const closeButtonHandler = useCallback(() => {
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  const redirectButtonHandler = useCallback(() => {
    if (!redirectUri) {
      return;
    }
    Linking.openURL(redirectUri)
      .then(closeButtonHandler)
      .catch((e) => {
        reportException(e, "Couldn't open redirect URI");
      });
  }, [closeButtonHandler, redirectUri]);

  const androidBackHandler = useCallback(() => {
    closeButtonHandler();
    return false;
  }, [closeButtonHandler]);
  useBlockOSBackNavigation(Platform.OS === 'ios', androidBackHandler);

  return (
    <ProcessingView
      button={
        state === LoaderViewState.Success && redirectUri
          ? {
              onPress: redirectButtonHandler,
              testID: 'CredentialAcceptProcessScreen.redirect',
              title: translate('common.backToService'),
              type: ButtonType.Primary,
            }
          : undefined
      }
      error={error}
      loaderLabel={loaderLabel}
      onClose={closeButtonHandler}
      secondaryButton={
        state === LoaderViewState.Success && redirectUri
          ? {
              onPress: closeButtonHandler,
              testID: 'CredentialAcceptProcessScreen.close',
              title: translate('common.close'),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      state={state}
      testID="CredentialAcceptProcessScreen"
      title={translate('common.credentialOffering')}
    />
  );
});

export default CredentialAcceptResultScreen;
