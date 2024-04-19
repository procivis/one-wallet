import {
  TouchableOpacity,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { Insets, StyleSheet, TouchableOpacityProps } from 'react-native';

import { FilterIcon } from '../icon/common-icon';

export interface FilterButtonProps extends TouchableOpacityProps {
  active: boolean;
}

const hitslop: Insets = { bottom: 4, left: 4, right: 4, top: 4 };

export const FilterButton: FC<FilterButtonProps> = ({
  active,
  style,
  ...props
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={hitslop}
      style={[
        styles.button,
        { backgroundColor: active ? colorScheme.accent : undefined },
        style,
      ]}
      {...props}
    >
      <FilterIcon color={active ? colorScheme.white : colorScheme.accent} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
