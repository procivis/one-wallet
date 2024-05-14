import { useCallback, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useOnScrollHeaderState = (offset = 30) => {
  const [titleVisible, setTitleVisible] = useState(false);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollOffset = event.nativeEvent.contentOffset.y;
      setTitleVisible(scrollOffset > offset);
    },
    [offset],
  );

  return { onScroll, titleVisible };
};
