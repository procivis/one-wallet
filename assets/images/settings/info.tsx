import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const InfoIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={17} height={16} viewBox="0 0 17 16" fill="none" {...props}>
      <Path
        d="M8.82967 6.73193C8.94012 6.73193 9.02967 6.82147 9.02967 6.93193V11.8C9.02967 11.9105 8.94012 12 8.82967 12H8.16875C8.05829 12 7.96875 11.9105 7.96875 11.8V6.93193C7.96875 6.82147 8.05829 6.73193 8.16875 6.73193H8.82967ZM7.96875 4.2C7.96875 4.08954 8.0583 4 8.16875 4L8.82966 4C8.94012 4 9.02966 4.08954 9.02966 4.2L9.02966 4.89863C9.02966 5.00909 8.94012 5.09863 8.82966 5.09863H8.16875C8.0583 5.09863 7.96875 5.00909 7.96875 4.89863L7.96875 4.2Z"
        fill={colorScheme.text}
      />
      <Path
        fillRule="evenodd"
        d="M8.5 15C12.366 15 15.5 11.866 15.5 8C15.5 4.13401 12.366 1 8.5 1C4.63401 1 1.5 4.13401 1.5 8C1.5 11.866 4.63401 15 8.5 15ZM8.5 16C12.9183 16 16.5 12.4183 16.5 8C16.5 3.58172 12.9183 0 8.5 0C4.08172 0 0.5 3.58172 0.5 8C0.5 12.4183 4.08172 16 8.5 16Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};

export default InfoIcon;
