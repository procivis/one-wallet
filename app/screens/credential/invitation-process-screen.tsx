import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import ONE from 'react-native-one-core';

import { translate } from '../../i18n';
import { InvitationRouteProp } from '../../navigators/invitation/invitation-routes';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';

const InvitationProcessScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp<'Invitation'>>();
  const route = useRoute<InvitationRouteProp<'Processing'>>();
  const { invitationUrl } = route.params;
  useBlockOSBackNavigation();

  const [state, setState] = useState(LoadingResultState.InProgress);
  useEffect(() => {
    ONE.handleInvitation(invitationUrl)
      .then(() => {
        setState(LoadingResultState.Success);
      })
      .catch((err) => {
        reportException(err, 'Invitation failure');
        setState(LoadingResultState.Failure);
      });
  }, [invitationUrl]);

  const onConfirm = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      variation={LoadingResultVariation.Neutral}
      state={state}
      title={translate(`invitation.process.${state}.title`)}
      subtitle={translate(`invitation.process.${state}.subtitle`)}
      onClose={onConfirm}
      successCloseButtonLabel={translate('invitation.process.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      failureCloseButtonLabel={translate('invitation.process.close')}
    />
  );
};

export default InvitationProcessScreen;
