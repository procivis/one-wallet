import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const DeleteIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={13} height={16} viewBox="0 0 13 16" fill="none" {...props}>
      <Path d="M2.375 5.09375V14.6331H10.625V5.09375" stroke={colorScheme.text} />
      <Path d="M1 3.04681H12" stroke={colorScheme.text} strokeLinecap="square" />
      <Path d="M6.5 6.45825V11.9165" stroke={colorScheme.text} strokeLinecap="square" />
      <Path d="M6.5 1V2.3645" stroke={colorScheme.text} strokeLinecap="square" />
    </Svg>
  );
};

export default DeleteIcon;
