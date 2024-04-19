import React, { FC } from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?node-id=89-86
export const NextIcon: FC<SvgProps> = ({ color, ...props }) => (
  <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
    <Path
      d="M8.62948 6.10988C8.69502 6.03977 8.78652 6 8.88228 6C8.97805 6 9.06954 6.03977 9.13508 6.10988L15 11.9841L9.13508 17.9018C8.99178 18.0327 8.77278 18.0327 8.62948 17.9018L8.10944 17.3796C8.03961 17.3138 8 17.222 8 17.1258C8 17.0297 8.03961 16.9378 8.10944 16.872L12.9487 12.0131L8.10944 7.12517C8.03961 7.05937 8 6.9675 8 6.87135C8 6.7752 8.03961 6.68333 8.10944 6.61753L8.62948 6.10988Z"
      fill={color}
    />
  </Svg>
);

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?node-id=1144-58
export const FilterIcon: FC<SvgProps> = ({ color, ...props }) => (
  <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
    <Rect
      fill={color}
      height={1}
      stroke={color}
      strokeWidth={0.5}
      width={14}
      x={5}
      y={6}
    />
    <Rect
      fill={color}
      height={1}
      stroke={color}
      strokeWidth={0.5}
      width={10}
      x={7}
      y={11}
    />
    <Rect
      fill={color}
      height={1}
      stroke={color}
      strokeWidth={0.5}
      width={4}
      x={10}
      y={16}
    />
  </Svg>
);
