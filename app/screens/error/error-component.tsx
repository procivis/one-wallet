import { ErrorScreen, ErrorScreenVariation } from '@procivis/react-native-components';
import React, { ErrorInfo } from 'react';

import { translate } from '../../i18n';

export interface ErrorComponentProps {
  error: Error;
  errorInfo: ErrorInfo;
  onReset(): void;
}

export const ErrorComponent: React.FunctionComponent<ErrorComponentProps> = (props) => {
  return (
    <ErrorScreen
      variation={ErrorScreenVariation.Neutral}
      title={translate('errorScreen.title')}
      subtitle={__DEV__ ? String(props.error) : translate('errorScreen.friendlySubtitle')}
      buttons={[
        {
          label: translate('errorScreen.reset'),
          onPress: props.onReset,
        },
      ]}
    />
  );
};
