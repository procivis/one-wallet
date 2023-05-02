import { useAppColorScheme } from '@procivis/react-native-components';
import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const FavoritesIcon: React.FunctionComponent<SvgProps> = (props) => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12Z"
        fill={colorScheme.background}
      />
      <Path d="M18 3v2h2v1h-2v2h-1V6h-2V5h2V3h1Z" fill={colorScheme.text} />
      <Path
        d="M12.951 6.309c-.3-.921-1.603-.921-1.902 0l-.984 3.028H6.881c-.968 0-1.371 1.24-.587 1.809l2.575 1.871-.984 3.028c-.299.921.756 1.688 1.54 1.118L12 15.292l2.576 1.871c.783.57 1.838-.197 1.538-1.118l-.983-3.028 2.575-1.871c.784-.57.381-1.81-.587-1.81h-3.184L12.95 6.31Zm-1.935 3.337L12 6.618l.984 3.028a1 1 0 0 0 .95.69h3.185l-2.576 1.872a1 1 0 0 0-.363 1.118l.983 3.028-2.575-1.871a1 1 0 0 0-1.176 0l-2.575 1.871.983-3.028a1 1 0 0 0-.363-1.118l-2.576-1.871h3.184a1 1 0 0 0 .951-.691Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};

export default FavoritesIcon;
