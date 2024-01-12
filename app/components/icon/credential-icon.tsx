import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

// Generic Icons for credentials

// https://www.figma.com/file/Mj9Nm9CUtauth6jt49UL7t/OTS-Developments-2023?node-id=1496%3A75432
export const MissingCredentialIcon: React.FunctionComponent<SvgProps> = ({
  ...props
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={48} viewBox="0 0 48 48" width={48} {...props}>
      <Rect fill={colorScheme.alert} height="48" width="48" />
      <Path
        d="M22.2967 17.7679C23.0777 16.4988 24.9223 16.4988 25.7033 17.7679L33.1242 29.8268C33.9442 31.1593 32.9855 32.875 31.4209 32.875H16.5791C15.0145 32.875 14.0558 31.1593 14.8758 29.8268L22.2967 17.7679Z"
        fill={colorScheme.alertText}
        fillRule="evenodd"
      />
      <Path d="M25 21H23V26H25V21Z" fill={colorScheme.white} />
      <Path d="M25 28H23V30H25V28Z" fill={colorScheme.white} />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=404-355&mode=design&t=DIJGwVXRoMIeamtV-4
export const AlertOutlineIcon: React.FunctionComponent<SvgProps> = ({
  ...props
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M10.6198 5.76789C11.4007 4.49881 13.2454 4.49882 14.0264 5.76789L21.7703 18.3518C22.5904 19.6843 21.6317 21.4 20.067 21.4H4.57912C3.01448 21.4 2.05579 19.6843 2.87581 18.3518L10.6198 5.76789Z"
        fillRule="evenodd"
        stroke={colorScheme.text}
      />
      <Rect fill={colorScheme.text} height="1" width="1" x="12" y="18" />
      <Rect fill={colorScheme.text} height="5.75" width="1" x="12" y="10" />
    </Svg>
  );
};
