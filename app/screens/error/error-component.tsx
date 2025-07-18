import { ErrorScreen } from '@procivis/one-react-native-components';
import React from 'react';

import { translate } from '../../i18n';

export interface ErrorComponentProps {
  error: Error;
  onReset(this: void): void;
}

export const ErrorComponent: React.FunctionComponent<ErrorComponentProps> = (
  props,
) => {
  return (
    <ErrorScreen
      button={{
        label: translate('common.close'),
        onPress: props.onReset,
      }}
      subtitle={
        __DEV__
          ? String(props.error)
          : translate('info.errorScreen.friendlySubtitle')
      }
      title={translate('info.errorScreen.title')}
    />
  );
};
