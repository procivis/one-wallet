import {
  reportException,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { TranslateOptions } from 'i18n-js/typings';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Linking, StyleSheet, Text } from 'react-native';

import { translate } from '../../i18n';

const Link: FunctionComponent<{
  label: string;
  url: string;
}> = ({ label, url }) => {
  const openURL = useCallback(() => {
    Linking.openURL(url).catch((e) =>
      reportException(e, 'Opening share disclaimer link'),
    );
  }, [url]);

  return (
    <Text onPress={openURL} style={styles.link}>
      {label}
    </Text>
  );
};

const ShareDisclaimer: FunctionComponent<{
  action: string;
  ppUrl?: string;
  testID: string;
}> = ({ ppUrl, testID, action }) => {
  const colorScheme = useAppColorScheme();
  const lowerCaseAction = action.toLowerCase();

  const opts = useMemo(() => {
    const result: TranslateOptions = { action: lowerCaseAction };
    if (ppUrl) {
      result.pp = (
        <Link label={translate('common.privacyPolicy')} url={ppUrl} />
      );
    }
    return result;
  }, [lowerCaseAction, ppUrl]);

  const label = ppUrl ? 'ppOnly' : 'noUrls';

  return (
    <Typography
      color={colorScheme.text}
      preset="s"
      style={styles.text}
      testID={testID}
    >
      {translate(`shareDisclaimer.${label}`, opts)}
    </Typography>
  );
};

export default ShareDisclaimer;

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
  text: {
    paddingTop: 16,
    textAlign: 'center',
  },
});
