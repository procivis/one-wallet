import { useAppColorScheme } from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?node-id=89-86
export const NextIcon: FC<SvgProps> = ({ color, ...props }) => {
  const colorScheme = useAppColorScheme();
  const iconColor = color ?? colorScheme.text;
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M8.62948 6.10988C8.69502 6.03977 8.78652 6 8.88228 6C8.97805 6 9.06954 6.03977 9.13508 6.10988L15 11.9841L9.13508 17.9018C8.99178 18.0327 8.77278 18.0327 8.62948 17.9018L8.10944 17.3796C8.03961 17.3138 8 17.222 8 17.1258C8 17.0297 8.03961 16.9378 8.10944 16.872L12.9487 12.0131L8.10944 7.12517C8.03961 7.05937 8 6.9675 8 6.87135C8 6.7752 8.03961 6.68333 8.10944 6.61753L8.62948 6.10988Z"
        fill={iconColor}
      />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?node-id=1144-58
export const FilterIcon: FC<SvgProps> = ({ color, ...props }) => {
  const colorScheme = useAppColorScheme();
  const iconColor = color ?? colorScheme.text;
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Rect
        fill={iconColor}
        height={1}
        stroke={iconColor}
        strokeWidth={0.5}
        width={14}
        x={5}
        y={6}
      />
      <Rect
        fill={iconColor}
        height={1}
        stroke={iconColor}
        strokeWidth={0.5}
        width={10}
        x={7}
        y={11}
      />
      <Rect
        fill={iconColor}
        height={1}
        stroke={iconColor}
        strokeWidth={0.5}
        width={4}
        x={10}
        y={16}
      />
    </Svg>
  );
};

// https://www.figma.com/file/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?node-id=621%3A19281&mode=dev
export const ShareIcon: FC<SvgProps> = ({ color, ...props }) => {
  const colorScheme = useAppColorScheme();
  const iconColor = color ?? colorScheme.text;
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M6.955 20.927c-.92 0-1.611-.229-2.074-.686-.457-.451-.686-1.13-.686-2.039V9.431c0-.909.229-1.588.686-2.04.463-.456 1.154-.685 2.074-.685h2.646v1.415H6.973c-.44 0-.777.117-1.011.352-.234.234-.352.58-.352 1.037v8.613c0 .457.118.803.352 1.037.234.235.571.352 1.01.352H17.01c.433 0 .77-.117 1.01-.352.24-.234.36-.58.36-1.037V9.51c0-.457-.12-.803-.36-1.037-.24-.235-.577-.352-1.01-.352h-2.62V6.706h2.646c.92 0 1.608.229 2.066.686.462.457.694 1.136.694 2.039v8.771c0 .902-.232 1.582-.694 2.04-.457.456-1.146.685-2.066.685H6.956zm5.036-6.882a.69.69 0 01-.492-.202.66.66 0 01-.202-.484V4.333l.053-1.318-.598.624-1.327 1.424a.612.612 0 01-.484.21.618.618 0 01-.457-.175.607.607 0 01-.175-.449.65.65 0 01.202-.457l2.97-2.865c.094-.088.18-.15.255-.184a.641.641 0 01.51 0 .842.842 0 01.255.184l2.97 2.865c.141.141.212.293.212.457a.592.592 0 01-.185.449.637.637 0 01-.457.175.602.602 0 01-.475-.21L13.23 3.639l-.588-.624.052 1.318v9.026c0 .188-.07.349-.21.484a.67.67 0 01-.493.202z"
        fill={iconColor}
      />
    </Svg>
  );
};

// https://www.figma.com/file/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?node-id=621%3A29409&mode=dev
export const DownloadIcon: FC<SvgProps> = ({ color, ...props }) => {
  const colorScheme = useAppColorScheme();
  const fillColor = color ?? colorScheme.text;
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M6.955 20.927c-.92 0-1.611-.229-2.074-.686-.457-.451-.686-1.13-.686-2.039V9.431c0-.909.229-1.588.686-2.04.463-.456 1.154-.685 2.074-.685h2.646v1.415H6.973c-.44 0-.777.117-1.011.352-.234.234-.352.58-.352 1.037v8.613c0 .457.118.803.352 1.037.234.235.571.352 1.01.352H17.01c.433 0 .77-.117 1.01-.352.24-.234.36-.58.36-1.037V9.51c0-.457-.12-.803-.36-1.037-.24-.235-.577-.352-1.01-.352h-2.62V6.706h2.646c.92 0 1.608.229 2.066.686.462.457.694 1.136.694 2.039v8.771c0 .902-.232 1.582-.694 2.04-.457.456-1.146.685-2.066.685H6.956zm5.036-5.783a.753.753 0 01-.255-.044 1.014 1.014 0 01-.255-.185l-2.97-2.874a.63.63 0 01-.202-.457c0-.182.058-.328.175-.44a.618.618 0 01.457-.175c.2 0 .36.07.484.21l1.327 1.416.598.624-.053-1.319V2.637a.66.66 0 01.202-.484.689.689 0 01.492-.202.67.67 0 01.492.202c.141.135.211.296.211.484V11.9l-.052 1.319.588-.624 1.336-1.415a.602.602 0 01.475-.211c.182 0 .334.058.457.176a.564.564 0 01.185.439c0 .17-.07.322-.211.457L12.5 14.915a.841.841 0 01-.255.185.705.705 0 01-.255.044z"
        fill={fillColor}
      />
    </Svg>
  );
};
