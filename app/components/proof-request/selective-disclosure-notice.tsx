import { CredentialWarningIcon } from '@procivis/one-react-native-components';
import {
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { translate } from '../../i18n';

export const SelectiveDislosureNotice: FunctionComponent<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}> = ({ testID, style }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[styles.notice, { backgroundColor: colorScheme.notice }, style]}
      testID={testID}
    >
      <CredentialWarningIcon />
      <Typography color={colorScheme.noticeText} size="sml" style={styles.text}>
        {translate('proofRequest.selectiveDisclosure.notice')}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  notice: {
    borderRadius: 4,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    flex: 1,
    marginLeft: 8,
  },
});
