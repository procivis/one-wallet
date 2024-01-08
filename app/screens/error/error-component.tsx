import {
  ErrorScreen,
  ErrorScreenVariation,
} from '@procivis/react-native-components';
import React, { ErrorInfo } from 'react';

import { translate } from '../../i18n';

export interface ErrorComponentProps {
  error: Error;
  errorInfo: ErrorInfo;
  onReset(): void;
}

export const ErrorComponent: React.FunctionComponent<ErrorComponentProps> = (
  props,
) => {
  return (
    <ErrorScreen
      buttons={[
        {
          label: translate('common.close'),
          onPress: props.onReset,
        },
      ]}
      subtitle={
        __DEV__
          ? String(props.error)
          : translate('errorScreen.friendlySubtitle')
      }
      title={translate('errorScreen.title')}
      variation={ErrorScreenVariation.Neutral}
    />
  );
};
