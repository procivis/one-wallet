import { useAppColorScheme } from '@procivis/one-react-native-components';
import { useClipboard } from '@react-native-clipboard/clipboard';
import { useCallback } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { Alert, Platform, ToastAndroid } from 'react-native';

import { translate } from '../i18n/translate';

export function useCopyToClipboard() {
  const { darkMode } = useAppColorScheme();
  const [, setClipboard] = useClipboard();

  return useCallback(
    (content: string) => {
      setClipboard(content);
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          translate('common.copiedToClipboard'),
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      } else {
        Alert.alert(
          translate('common.copiedToClipboard'),
          undefined,
          [
            {
              style: 'cancel',
              text: translate('common.ok'),
            },
          ],
          { userInterfaceStyle: darkMode ? 'dark' : 'light' },
        );
      }
    },
    [darkMode, setClipboard],
  );
}
