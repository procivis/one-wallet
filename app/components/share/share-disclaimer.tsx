import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent, useCallback } from 'react';
import { Linking, StyleSheet, Text } from 'react-native';

import { translate } from '../../i18n';

const Link: FunctionComponent<{
  label: string;
  testID: string;
  url: string;
}> = ({ label, url, testID }) => {
  const openURL = useCallback(() => {
    Linking.openURL(url);
  }, [url]);

  return (
    <Text onPress={openURL} style={styles.link} testID={testID}>
      {label}
    </Text>
  );
};

const ShareDisclaimer: FunctionComponent<{
  ppUrl?: string;
  tosUrl?: string;
}> = ({ tosUrl, ppUrl }) => {
  const colorScheme = useAppColorScheme();

  if (tosUrl && ppUrl) {
    return (
      <Typography color={colorScheme.text} preset="s" style={styles.wrapper}>
        {translate('shareDisclaimer.tosAndPp', {
          pp: (
            <Link
              label={translate('common.privacyPolicy')}
              testID="privacyPolicy"
              url={ppUrl}
            />
          ),
          tos: (
            <Link
              label={translate('common.termsOfServices')}
              testID="termsOfServices"
              url={tosUrl}
            />
          ),
        })}
      </Typography>
    );
  }

  if (tosUrl && !ppUrl) {
    return (
      <Typography color={colorScheme.text} preset="s" style={styles.wrapper}>
        {translate('shareDisclaimer.tosOnly', {
          tos: (
            <Link
              label={translate('common.termsOfServices')}
              testID="termsOfServices"
              url={tosUrl}
            />
          ),
        })}
      </Typography>
    );
  }

  if (ppUrl && !tosUrl) {
    return (
      <Typography color={colorScheme.text} preset="s" style={styles.wrapper}>
        {translate('shareDisclaimer.ppOnly', {
          tos: (
            <Link
              label={translate('common.privacyPolicy')}
              testID="termsOfServices"
              url={ppUrl}
            />
          ),
        })}
      </Typography>
    );
  }

  return (
    <Typography color={colorScheme.text} preset="s" style={styles.wrapper}>
      {translate('shareDisclaimer.noUrls')}
    </Typography>
  );
};

export default ShareDisclaimer;

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
  wrapper: {
    paddingTop: 16,
    textAlign: 'center',
  },
});
