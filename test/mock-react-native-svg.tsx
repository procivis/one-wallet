/* eslint-disable @typescript-eslint/naming-convention */

import React, { FC } from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';

jest.doMock('react-native-svg', () => {
  const rnsvg: Record<string, unknown> = jest.requireActual('react-native-svg');

  const MockSvg: FC<SvgProps> = ({ children: _, ...props }) => (
    <View testID="SVG" {...props} />
  );
  MockSvg.displayName = 'MockSvg';

  return {
    __esModule: true,
    ...rnsvg,
    Svg: MockSvg,
    default: MockSvg,
  };
});
