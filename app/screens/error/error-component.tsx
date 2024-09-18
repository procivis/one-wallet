import {
  ErrorScreen,
  ErrorScreenVariation,
} from '@procivis/one-react-native-components';
import React from 'react';

import { translate } from '../../i18n';

export interface ErrorComponentProps {
  error: Error;
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
