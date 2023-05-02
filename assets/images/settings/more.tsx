import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const MoreIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={15} height={4} viewBox="0 0 15 4" fill="none" {...props}>
      <Path
        d="M2.75116 2.33352C2.75116 3.09219 2.13516 3.70819 1.37649 3.70819C0.615155 3.70819 0.000488281 3.09219 0.000488281 2.33352C0.000488281 1.57352 0.615155 0.95752 1.37649 0.95752C2.13516 0.95752 2.75116 1.57352 2.75116 2.33352Z"
        fill={colorScheme.text}
      />
      <Path
        d="M8.70965 2.33352C8.70965 3.09219 8.09365 3.70819 7.33365 3.70819C6.57365 3.70819 5.95898 3.09219 5.95898 2.33352C5.95898 1.57352 6.57365 0.95752 7.33365 0.95752C8.09365 0.95752 8.70965 1.57352 8.70965 2.33352Z"
        fill={colorScheme.text}
      />
      <Path
        d="M14.6667 2.33352C14.6667 3.09219 14.0507 3.70819 13.292 3.70819C12.5307 3.70819 11.916 3.09219 11.916 2.33352C11.916 1.57352 12.5307 0.95752 13.292 0.95752C14.0507 0.95752 14.6667 1.57352 14.6667 2.33352Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};

export default MoreIcon;
