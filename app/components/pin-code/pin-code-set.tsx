import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import React, { FC } from 'react';

import { translate } from '../../i18n';

interface PinCodeSetProps {
  onClose: () => void;
  state?: LoadingResultState;
  subtitle: string;
  title: string;
}

const PinCodeSet: FC<PinCodeSetProps> = ({
  onClose,
  state = LoadingResultState.Success,
  subtitle,
  title,
}) => {
  useBlockOSBackNavigation();

  return (
    <LoadingResult
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.close')}
      onClose={onClose}
      state={state}
      subtitle={subtitle}
      successCloseButtonLabel={translate('common.continue')}
      testID="PinCodeSetScreen"
      title={title}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default PinCodeSet;
