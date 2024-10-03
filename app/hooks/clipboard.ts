import { useAppColorScheme } from '@procivis/one-react-native-components';
import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback } from 'react';
// eslint-disable-next-line react-native/split-platform-components
import { Alert, Platform, ToastAndroid } from 'react-native';

import { translate } from '../i18n/translate';

export function useCopyToClipboard() {
  const { darkMode } = useAppColorScheme();

  return useCallback(
    (content: string) => {
      Clipboard.setString(content);
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
    [darkMode],
  );
}
