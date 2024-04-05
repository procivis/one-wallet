declare module '@carimus/metro-symlinked-deps';
declare module '@react-native/normalize-color';

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png';
