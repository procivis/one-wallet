import { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useListContentInset = (
  { additionalBottomPadding = 54, headerHeight = 48 } = {
    additionalBottomPadding: 54,
    headerHeight: 48,
  },
) => {
  const safeAreaInsets = useSafeAreaInsets();
  const contentInsetsStyle: ViewStyle = {
    paddingBottom: safeAreaInsets.bottom + additionalBottomPadding,
    paddingTop: safeAreaInsets.top + headerHeight,
  };
  return contentInsetsStyle;
};
