import { Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListContentInsetProps = {
  additionalBottomPadding?: number;
  headerHeight?: number;
  modalPresentation?: boolean;
};

export const useListContentInset = (
  {
    additionalBottomPadding = 54,
    headerHeight = 48,
    modalPresentation = false,
  }: ListContentInsetProps = {
    additionalBottomPadding: 54,
    headerHeight: 48,
    modalPresentation: false,
  },
) => {
  const { top, bottom } = useSafeAreaInsets();
  const topSafeAreaInset =
    !modalPresentation || Platform.OS === 'android' ? top : 0;
  const contentInsetsStyle: ViewStyle = {
    paddingBottom: bottom + additionalBottomPadding,
    paddingTop: topSafeAreaInset + headerHeight,
  };
  return contentInsetsStyle;
};
