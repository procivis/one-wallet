import { useAppColorScheme } from '@procivis/react-native-components';
import React, { FC } from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

// Icons used on the settings screen: https://www.figma.com/file/Mj9Nm9CUtauth6jt49UL7t/OTS-Developments-2023?type=design&node-id=13-15689&t=GXsNdBzYheEWxZvG-4

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=41-901&t=v3fZr6gOFMtdEYcy-4
export const LanguageIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M6.26086 12C6.26086 8.83617 8.83617 6.26086 12 6.26086C15.1649 6.26086 17.7391 8.83617 17.7391 12C17.7391 15.1649 15.1649 17.7391 12 17.7391C8.83617 17.7391 6.26086 15.1649 6.26086 12ZM9.93913 11.4783H11.4783V7.49634C10.728 7.98365 10.0445 9.46434 9.93913 11.4783ZM12.5217 7.49634V11.4783H14.0619C13.9555 9.46434 13.273 7.98365 12.5217 7.49634ZM16.6435 11.4783H15.1033C15.0355 10.056 14.7078 8.79443 14.1892 7.87095C15.5249 8.5826 16.4671 9.90886 16.6435 11.4783ZM14.1892 16.129C14.7078 15.2056 15.0355 13.944 15.1033 12.5217H16.6435C16.4671 14.0911 15.5249 15.4174 14.1892 16.129ZM12.5217 16.5036V12.5217H14.0619C13.9555 14.5367 13.273 16.0163 12.5217 16.5036ZM11.4783 16.5036C10.728 16.0163 10.0445 14.5367 9.93913 12.5217H11.4783V16.5036ZM7.35756 11.4783H8.89773C8.96556 10.056 9.29321 8.79443 9.81182 7.87095C8.47513 8.5826 7.53391 9.90886 7.35756 11.4783ZM7.35756 12.5217H8.89773C8.96556 13.944 9.29321 15.2056 9.81182 16.129C8.47513 15.4174 7.53391 14.0911 7.35756 12.5217Z"
        fill={colorScheme.text}
        fillRule="evenodd"
      />
    </Svg>
  );
};

// https://www.figma.com/file/RVk1ou3IWFWuRHZQgC0f7e/Procivis-One-Developments-2024?type=design&node-id=4185-112703
export const HistoryIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Circle cx="16" cy="16" r="4" stroke={colorScheme.text} />
      <Path
        d="M16 13.8177V15.9996"
        stroke={colorScheme.text}
        stroke-linecap="square"
      />
      <Path
        d="M16.5091 16.0004H17.6727"
        stroke={colorScheme.text}
        stroke-linecap="square"
      />
      <Path d="M18 8L6 8" stroke={colorScheme.text} />
      <Path d="M12 12H6" stroke={colorScheme.text} />
      <Path d="M10 16H6" stroke={colorScheme.text} />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=41-632&t=ExFCur2RDCznJCXv-4
export const FaceIDIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M13.6292 6.99989V5.99989H17.0002V9.37089H16.0002V6.99989H13.6292ZM13.4972 12.8829L13.8672 13.2529C13.9372 13.3329 13.9472 13.4729 13.8672 13.5629C13.5972 13.8029 13.3072 13.9929 12.9972 14.1329C12.5272 14.3529 12.0082 14.4629 11.4972 14.4629C10.9872 14.4629 10.4682 14.3529 9.99718 14.1229C9.71818 14.0029 9.44718 13.8429 9.20718 13.6329L9.15718 13.5929C9.14718 13.5829 9.13818 13.5729 9.13818 13.5629C9.05718 13.4729 9.06718 13.3329 9.13818 13.2529L9.50818 12.8829C9.51718 12.8729 9.52718 12.8629 9.53718 12.8629C9.61718 12.7929 9.72718 12.7929 9.81718 12.8529C9.82218 12.8579 9.82968 12.8629 9.83718 12.8679C9.84468 12.8729 9.85218 12.8779 9.85718 12.8829L9.87718 12.8929L9.88818 12.9029C10.0972 13.0729 10.3272 13.2029 10.5672 13.2829C11.1672 13.5129 11.8372 13.5229 12.4282 13.2929L12.4372 13.2829C12.6872 13.1929 12.9172 13.0629 13.1272 12.8929L13.1472 12.8829C13.152 12.8781 13.1593 12.8733 13.1666 12.8685L13.1666 12.8685C13.1745 12.8633 13.1825 12.8581 13.1872 12.8529C13.2772 12.7929 13.3882 12.7929 13.4682 12.8629C13.4772 12.8629 13.4872 12.8729 13.4972 12.8829L13.4972 12.8829ZM16.0002 15.9699H13.6292V16.9699H17.0002V13.5999H16.0002V15.9699ZM6.00018 13.5999H7.00018V15.9699H9.37018V16.9699H6.00018V13.5999ZM13.1962 10.5349H14.1962V9.32589H13.1962V10.5349ZM9.80518 10.5349H8.80518V9.32589H9.80518V10.5349ZM12.2402 9.32589H11.2402V11.4039H10.8292V12.4039H12.2402V9.32589ZM9.37018 6.99989H7.00018V9.37089H6.00018V5.99989H9.37018V6.99989Z"
        fill={colorScheme.text}
        fillRule="evenodd"
      />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=41-928&t=1XVJ4i2rfKHLPOK7-4
export const TouchIDIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M8.5 14.1C8.5 15.7753 10.067 17.1333 12 17.1333C13.933 17.1333 15.5 15.7753 15.5 14.1V8.9C15.5 7.22474 13.933 5.86667 12 5.86667C10.067 5.86667 8.5 7.22474 8.5 8.9V11.5C8.5 11.7761 8.27614 12 8 12C7.72386 12 7.5 11.7761 7.5 11.5V8.9C7.5 6.74609 9.51472 5 12 5C14.4853 5 16.5 6.74609 16.5 8.9V14.1C16.5 16.2539 14.4853 18 12 18C9.51472 18 7.5 16.2539 7.5 14.1V13.5C7.5 13.2239 7.72386 13 8 13C8.27614 13 8.5 13.2239 8.5 13.5V14.1Z"
        fill={colorScheme.text}
      />
      <Path
        d="M13.5 13.5V12.5C13.5 12.2239 13.7239 12 14 12C14.2761 12 14.5 12.2239 14.5 12.5V13.5C14.5 14.8807 13.3807 16 12 16C10.6193 16 9.5 14.8807 9.5 13.5V9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5V10.5C14.5 10.7761 14.2761 11 14 11C13.7239 11 13.5 10.7761 13.5 10.5V9.5C13.5 8.67157 12.8284 8 12 8C11.1716 8 10.5 8.67157 10.5 9.5V13.5C10.5 14.3284 11.1716 15 12 15C12.8284 15 13.5 14.3284 13.5 13.5Z"
        fill={colorScheme.text}
      />
      <Path
        d="M11.5 9.5C11.5 9.22386 11.7239 9 12 9C12.2761 9 12.5 9.22386 12.5 9.5V13.5C12.5 13.7761 12.2761 14 12 14C11.7239 14 11.5 13.7761 11.5 13.5V9.5Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=41-886&t=1XVJ4i2rfKHLPOK7-4
export const PINIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M8.06343 7.0314C8.06343 7.6014 7.60143 8.0634 7.03243 8.0634C6.46143 8.0634 6.00043 7.6014 6.00043 7.0314C6.00043 6.4624 6.46143 6.0004 7.03243 6.0004C7.60143 6.0004 8.06343 6.4624 8.06343 7.0314Z"
        fill={colorScheme.text}
        fillRule="evenodd"
      />
      <Path
        d="M12.5322 7.0314C12.5322 7.6014 12.0702 8.0634 11.5002 8.0634C10.9302 8.0634 10.4692 7.6014 10.4692 7.0314C10.4692 6.4624 10.9302 6.0004 11.5002 6.0004C12.0702 6.0004 12.5322 6.4624 12.5322 7.0314Z"
        fill={colorScheme.text}
        fillRule="evenodd"
      />
      <Path
        d="M17 7.0314C17 7.6014 16.538 8.0634 15.969 8.0634C15.398 8.0634 14.937 7.6014 14.937 7.0314C14.937 6.4624 15.398 6.0004 15.969 6.0004C16.538 6.0004 17 6.4624 17 7.0314Z"
        fill={colorScheme.text}
      />
      <Path
        d="M8.06343 11.5002C8.06343 12.0692 7.60143 12.5312 7.03243 12.5312C6.46143 12.5312 6.00043 12.0692 6.00043 11.5002C6.00043 10.9302 6.46143 10.4682 7.03243 10.4682C7.60143 10.4682 8.06343 10.9302 8.06343 11.5002Z"
        fill={colorScheme.text}
      />
      <Path
        d="M12.5322 11.5002C12.5322 12.0692 12.0702 12.5312 11.5002 12.5312C10.9302 12.5312 10.4692 12.0692 10.4692 11.5002C10.4692 10.9302 10.9302 10.4682 11.5002 10.4682C12.0702 10.4682 12.5322 10.9302 12.5322 11.5002Z"
        fill={colorScheme.text}
      />
      <Path
        d="M17 11.5002C17 12.0692 16.538 12.5312 15.969 12.5312C15.398 12.5312 14.937 12.0692 14.937 11.5002C14.937 10.9302 15.398 10.4682 15.969 10.4682C16.538 10.4682 17 10.9302 17 11.5002Z"
        fill={colorScheme.text}
      />
      <Path
        d="M8.06343 15.9679C8.06343 16.5379 7.60143 16.9999 7.03243 16.9999C6.46143 16.9999 6.00043 16.5379 6.00043 15.9679C6.00043 15.3989 6.46143 14.9369 7.03243 14.9369C7.60143 14.9369 8.06343 15.3989 8.06343 15.9679Z"
        fill={colorScheme.text}
      />
      <Path
        d="M12.5322 15.9679C12.5322 16.5379 12.0702 16.9999 11.5002 16.9999C10.9302 16.9999 10.4692 16.5379 10.4692 15.9679C10.4692 15.3989 10.9302 14.9369 11.5002 14.9369C12.0702 14.9369 12.5322 15.3989 12.5322 15.9679Z"
        fill={colorScheme.text}
      />
      <Path
        d="M17 15.9679C17 16.5379 16.538 16.9999 15.969 16.9999C15.398 16.9999 14.937 16.5379 14.937 15.9679C14.937 15.3989 15.398 14.9369 15.969 14.9369C16.538 14.9369 17 15.3989 17 15.9679Z"
        fill="#141414"
      />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=41-998&t=E25vUMKOIFYpFAuM-4
export const InformationIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M11.8304 10.7319C11.9409 10.7319 12.0304 10.8215 12.0304 10.9319V15.8C12.0304 15.9105 11.9409 16 11.8304 16H11.1695C11.059 16 10.9695 15.9105 10.9695 15.8V10.9319C10.9695 10.8215 11.059 10.7319 11.1695 10.7319H11.8304ZM10.9695 8.2C10.9695 8.08954 11.059 8 11.1695 8L11.8304 8C11.9409 8 12.0304 8.08954 12.0304 8.2L12.0304 8.89863C12.0304 9.00909 11.9409 9.09863 11.8304 9.09863H11.1695C11.059 9.09863 10.9695 9.00909 10.9695 8.89863L10.9695 8.2Z"
        fill={colorScheme.text}
      />
      <Path
        d="M11.5 19C15.366 19 18.5 15.866 18.5 12C18.5 8.13401 15.366 5 11.5 5C7.63401 5 4.5 8.13401 4.5 12C4.5 15.866 7.63401 19 11.5 19ZM11.5 20C15.9183 20 19.5 16.4183 19.5 12C19.5 7.58172 15.9183 4 11.5 4C7.08172 4 3.5 7.58172 3.5 12C3.5 16.4183 7.08172 20 11.5 20Z"
        fill={colorScheme.text}
        fillRule="evenodd"
      />
    </Svg>
  );
};

//https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=124-192&t=v3fZr6gOFMtdEYcy-4
export const DeleteIcon: FC<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
      <Path
        d="M7.375 9.09363V18.6329H15.625V9.09363"
        stroke={colorScheme.text}
      />
      <Path
        d="M6 7.04681H17"
        stroke={colorScheme.text}
        strokeLinecap="square"
      />
      <Path
        d="M11.5 10.4583V15.9165"
        stroke={colorScheme.text}
        strokeLinecap="square"
      />
      <Path
        d="M11.5 5V6.3645"
        stroke={colorScheme.text}
        strokeLinecap="square"
      />
    </Svg>
  );
};
