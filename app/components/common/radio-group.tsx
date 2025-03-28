import {
  RadioGroup as RadioGroupView,
  RadioGroupProps as RadioGroupViewProps,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent, useCallback } from 'react';

import { translate } from '../../i18n';

export type RadioGroupProps = Omit<
  RadioGroupViewProps,
  'onGetItemAccessibilityLabel'
>;

const RadioGroup: FunctionComponent<RadioGroupProps> = (props) => {
  const getItemAccessibilityLabel = useCallback(
    (current: number, length: number) => {
      return translate('accessibility.control.order', {
        current,
        length,
      });
    },
    [],
  );

  return (
    <RadioGroupView
      onGetItemAccessibilityLabel={getItemAccessibilityLabel}
      {...props}
    />
  );
};

export default RadioGroup;
