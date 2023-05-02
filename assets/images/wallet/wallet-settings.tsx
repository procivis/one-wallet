import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

const WalletSettingsIcon: React.FunctionComponent<SvgProps> = (props) => {
  const { fontScale } = useWindowDimensions();
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={40 * fontScale} height={40 * fontScale} viewBox="0 0 40 40" fill="none" {...props}>
      <Path
        d="M27.794 21.023c-.049.386.109.769.414 1.009l2.173 1.71-1.951 3.375-2.554-1.036a1.109 1.109 0 0 0-1.093.148c-.558.43-1.12.771-1.769 1.039-.364.15-.62.482-.675.871l-.38 2.719h-3.913l-.38-2.719a1.109 1.109 0 0 0-.689-.877c-.631-.25-1.188-.596-1.755-1.033a1.109 1.109 0 0 0-1.093-.148l-2.553 1.036-1.951-3.376 2.172-1.709c.306-.24.463-.623.415-1.009A8.21 8.21 0 0 1 12.137 20c0-.33.03-.676.076-1.067a1.108 1.108 0 0 0-.423-1.007l-2.163-1.67 1.95-3.374 2.556 1.027c.36.144.768.09 1.078-.142.575-.431 1.134-.778 1.766-1.03.371-.146.634-.481.69-.876l.379-2.719h3.914l.38 2.719c.054.395.317.73.688.877.633.25 1.192.598 1.766 1.029.31.232.719.286 1.078.142l2.557-1.027 1.95 3.373-2.163 1.671c-.308.238-.469.62-.423 1.007.046.391.076.736.076 1.067 0 .33-.03.66-.075 1.023Z"
        stroke={colorScheme.textSecondary}
        strokeWidth={2.217}
        strokeLinejoin="round"
      />
      <Path
        d="M20.003 23.08a3.08 3.08 0 1 1 0-6.16 3.08 3.08 0 0 1 0 6.16Z"
        stroke={colorScheme.textSecondary}
        strokeWidth={2.217}
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default WalletSettingsIcon;
