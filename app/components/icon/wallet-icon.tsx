import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
  SvgProps,
} from 'react-native-svg';

// Icons for the wallet dashboard: https://www.figma.com/file/Mj9Nm9CUtauth6jt49UL7t/OTS-Developments-2023?type=design&node-id=135-32814&t=GXsNdBzYheEWxZvG-4

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=359-214&t=ufy1cNOspgfh04Ka-4
export const SettingsIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={40} viewBox="0 0 40 40" width={40} {...props}>
      <Rect
        fill={colorScheme.textSecondary}
        height="2"
        width="21"
        x="10"
        y="16"
      />
      <Rect
        fill={colorScheme.textSecondary}
        height="2"
        width="21"
        x="10"
        y="23"
      />
      <Path
        d="M21 17C21 19.2091 19.2091 21 17 21C14.7909 21 13 19.2091 13 17C13 14.7909 14.7909 13 17 13C19.2091 13 21 14.7909 21 17Z"
        fill={colorScheme.white}
      />
      <Path
        d="M17 19C18.1046 19 19 18.1046 19 17C19 15.8954 18.1046 15 17 15C15.8954 15 15 15.8954 15 17C15 18.1046 15.8954 19 17 19ZM17 21C19.2091 21 21 19.2091 21 17C21 14.7909 19.2091 13 17 13C14.7909 13 13 14.7909 13 17C13 19.2091 14.7909 21 17 21Z"
        fill={colorScheme.textSecondary}
        fillRule="evenodd"
      />
      <Path
        d="M28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24Z"
        fill={colorScheme.white}
      />
      <Path
        d="M24 26C25.1046 26 26 25.1046 26 24C26 22.8954 25.1046 22 24 22C22.8954 22 22 22.8954 22 24C22 25.1046 22.8954 26 24 26ZM24 28C26.2091 28 28 26.2091 28 24C28 21.7909 26.2091 20 24 20C21.7909 20 20 21.7909 20 24C20 26.2091 21.7909 28 24 28Z"
        fill={colorScheme.textSecondary}
        fillRule="evenodd"
      />
    </Svg>
  );
};

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=285-205&t=45JyL15M5tlDkjwM-4
export const EmptyIcon: React.FunctionComponent<SvgProps> = ({
  color,
  ...props
}) => (
  <Svg fill="none" height={64} viewBox="0 0 64 64" width={64} {...props}>
    <Path
      d="M47.4362 8H23.0789C20.9791 8 19.2993 9.67982 19.2993 11.7796V15.5592H16.7796C14.6798 15.5592 13 17.239 13 19.3388V27.1644H15.5197V19.3388C15.5197 18.6668 16.1077 18.0789 16.7796 18.0789H40.717C41.3889 18.0789 41.9768 18.6668 41.9768 19.3388V52.0951C41.9768 52.7671 41.3889 53.355 40.717 53.355H16.7796C16.1077 53.355 15.5197 52.7671 15.5197 52.0951V27.1644H13V52.0951C13 54.1949 14.6798 55.8747 16.7796 55.8747H40.717C42.8167 55.8747 44.4965 54.1949 44.4965 52.0951V48.3156H47.4362C49.536 48.3156 51.2158 46.6357 51.2158 44.536V11.7796C51.2158 9.67982 49.536 8 47.4362 8ZM48.6961 44.536C48.6961 45.2079 48.1081 45.7958 47.4362 45.7958H44.4965V19.3388C44.4965 17.239 42.8167 15.5592 40.717 15.5592H21.819V11.7796C21.819 11.1077 22.407 10.5197 23.0789 10.5197H47.4362C48.1081 10.5197 48.6961 11.1077 48.6961 11.7796V44.536Z"
      fill={color}
    />
  </Svg>
);

// https://www.figma.com/file/S3WwgTMHuqxAsfu5zElCzq/App-Icon-Library-(Design)?type=design&node-id=89-86&t=4mzTEO913aBKgW7w-4
export const NextIcon: React.FunctionComponent<SvgProps> = ({
  color,
  ...props
}) => (
  <Svg fill="none" height={24} viewBox="0 0 24 24" width={24} {...props}>
    <Path
      d="M8.62948 6.10988C8.69502 6.03977 8.78652 6 8.88228 6C8.97805 6 9.06954 6.03977 9.13508 6.10988L15 11.9841L9.13508 17.9018C8.99178 18.0327 8.77278 18.0327 8.62948 17.9018L8.10944 17.3796C8.03961 17.3138 8 17.222 8 17.1258C8 17.0297 8.03961 16.9378 8.10944 16.872L12.9487 12.0131L8.10944 7.12517C8.03961 7.05937 8 6.9675 8 6.87135C8 6.7752 8.03961 6.68333 8.10944 6.61753L8.62948 6.10988Z"
      fill={color}
    />
  </Svg>
);

// https://www.figma.com/file/52qDYWUMjXAGre1dcnz5bz/Procivis-One-Wallet?type=design&node-id=426-19996&t=m7aYCyqnFetWyDBt-4
export const NoCredentialsIcon: React.FunctionComponent<SvgProps> = (props) => (
  <Svg fill="none" height="381" viewBox="0 0 257 381" width="257" {...props}>
    <Circle
      cx="128.5"
      cy="191.5"
      fill="url(#paint0_linear_2399_11695)"
      opacity="0.1"
      r="128"
    />
    <Rect
      fill="white"
      height="118.725"
      rx="10.4757"
      width="178.087"
      x="39.4565"
      y="132.138"
    />
    <Rect
      fill="url(#paint1_linear_2399_11695)"
      height="118.725"
      rx="10.4757"
      transform="rotate(-180 217.543 119.152)"
      width="178.087"
      x="217.543"
      y="119.152"
    />
    <Rect
      fill="url(#paint2_linear_2399_11695)"
      height="118.725"
      rx="10.4757"
      width="178.087"
      x="39.4565"
      y="261.993"
    />
    <Rect
      fill="#0F151A"
      height="1.85507"
      width="44.5217"
      x="108.094"
      y="189.645"
    />
    <Rect
      fill="#0F151A"
      height="1.85507"
      transform="rotate(90 131.283 168.312)"
      width="44.5217"
      x="131.283"
      y="168.312"
    />
    <Defs>
      <LinearGradient
        gradientUnits="userSpaceOnUse"
        id="paint0_linear_2399_11695"
        x1="128.5"
        x2="128.5"
        y1="63.5"
        y2="319.5"
      >
        <Stop stopColor="#21353A" />
        <Stop offset="1" stopColor="#21353A" stopOpacity="0" />
      </LinearGradient>
      <LinearGradient
        gradientUnits="userSpaceOnUse"
        id="paint1_linear_2399_11695"
        x1="306.587"
        x2="306.587"
        y1="119.152"
        y2="237.877"
      >
        <Stop stopColor="white" />
        <Stop offset="1" stopColor="white" stopOpacity="0" />
      </LinearGradient>
      <LinearGradient
        gradientUnits="userSpaceOnUse"
        id="paint2_linear_2399_11695"
        x1="128.5"
        x2="128.5"
        y1="261.993"
        y2="380.717"
      >
        <Stop stopColor="white" />
        <Stop offset="1" stopColor="white" stopOpacity="0" />
      </LinearGradient>
    </Defs>
  </Svg>
);
