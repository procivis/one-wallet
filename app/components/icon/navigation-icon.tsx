import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

// Icons for common navigation

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=41-469&t=JqOzGAz3i8qKhZ7S-4
export const MoreIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M8.41393 12.0002C8.41393 12.5939 7.93184 13.076 7.3381 13.076C6.74227 13.076 6.26123 12.5939 6.26123 12.0002C6.26123 11.4054 6.74227 10.9233 7.3381 10.9233C7.93184 10.9233 8.41393 11.4054 8.41393 12.0002Z"
        fill={colorScheme.text}
      />
      <Path
        d="M13.077 12.0002C13.077 12.5939 12.5949 13.076 12.0001 13.076C11.4054 13.076 10.9243 12.5939 10.9243 12.0002C10.9243 11.4054 11.4054 10.9233 12.0001 10.9233C12.5949 10.9233 13.077 11.4054 13.077 12.0002Z"
        fill={colorScheme.text}
      />
      <Path
        d="M17.7391 12.0002C17.7391 12.5939 17.257 13.076 16.6632 13.076C16.0674 13.076 15.5864 12.5939 15.5864 12.0002C15.5864 11.4054 16.0674 10.9233 16.6632 10.9233C17.257 10.9233 17.7391 11.4054 17.7391 12.0002Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};
