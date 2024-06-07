import {
  RadioGroup as RadioGroupView,
  RadioGroupProps as RadioGroupViewProps,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { translate } from '../../i18n';

export type RadioGroupItem = {
  key: React.Key;
  label: string;
  style?: StyleProp<ViewStyle>;
};

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
