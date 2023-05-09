import React from 'react';
import { ColorValue } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

type Props = SvgProps & {
  foreground: ColorValue;
};

const CheckIcon: React.FunctionComponent<Props> = ({ foreground, ...props }) => (
  <Svg viewBox="0 0 17 18" {...props}>
    <Path
      d="M6.52653 12.5848L2.57174 8.5987C2.47609 8.49175 2.47609 8.33 2.57174 8.22305L2.9474 7.85783C3.04883 7.7584 3.21118 7.7584 3.31261 7.85783L6.52653 11.1135L12.6413 5.07174C12.7483 4.97609 12.91 4.97609 13.017 5.07174L13.3822 5.4474C13.4764 5.55091 13.4764 5.7091 13.3822 5.81261L6.52653 12.5848Z"
      fill={foreground}
    />
  </Svg>
);

export default CheckIcon;
