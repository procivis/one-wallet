import { useAppColorScheme } from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

// https://www.figma.com/file/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?node-id=542-90920
export const PurposeInfoIcon: FC<SvgProps> = () => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24}>
      <Path
        d="M12.3609 10.7319C12.4714 10.7319 12.5609 10.8215 12.5609 10.9319V15.8C12.5609 15.9105 12.4714 16 12.3609 16H11.7C11.5895 16 11.5 15.9105 11.5 15.8V10.9319C11.5 10.8215 11.5895 10.7319 11.7 10.7319H12.3609ZM11.5 8.2C11.5 8.08954 11.5895 8 11.7 8L12.3609 8C12.4714 8 12.5609 8.08954 12.5609 8.2L12.5609 8.89863C12.5609 9.00909 12.4714 9.09863 12.3609 9.09863H11.7C11.5895 9.09863 11.5 9.00909 11.5 8.89863L11.5 8.2Z"
        fill={colorScheme.text}
      />
      <Path
        d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
        fill={colorScheme.text}
        fillRule="evenodd"
      />
    </Svg>
  );
};
