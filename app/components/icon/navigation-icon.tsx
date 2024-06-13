import { useAppColorScheme } from '@procivis/one-react-native-components';
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

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?node-id=41%3A994&t=5URobypfDocdb0UT-4
export const HelpIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M8.00054 9.45C8.12654 7.526 9.73154 6 11.6875 6C13.7235 6 15.3805 7.658 15.3805 9.695C15.3805 11.556 13.9985 13.099 12.2065 13.353V14.682C12.2065 14.809 12.1045 14.911 11.9775 14.911H11.3965C11.2695 14.911 11.1665 14.809 11.1665 14.682V12.579C11.1665 12.452 11.2695 12.35 11.3965 12.35H11.6875C13.1495 12.35 14.3415 11.159 14.3415 9.695C14.3415 8.231 13.1495 7.04 11.6875 7.04C10.2935 7.04 9.14754 8.119 9.03954 9.485C9.03054 9.604 8.93154 9.695 8.81254 9.695H8.22954C8.09654 9.695 7.99154 9.582 8.00054 9.45ZM11.4495 15.961H11.9185C12.0755 15.961 12.2035 16.088 12.2035 16.246V16.715C12.2035 16.873 12.0755 17 11.9185 17H11.4495C11.2925 17 11.1645 16.873 11.1645 16.715V16.246C11.1645 16.088 11.2925 15.961 11.4495 15.961Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};
