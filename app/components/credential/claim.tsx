import {
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { Claim as CredentialClaim } from '@procivis/react-native-one-core';
import React, { FunctionComponent, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { translate } from '../../i18n';
import { ClaimValue } from './claim-value';

export const Claim: FunctionComponent<{
  claim: CredentialClaim | undefined;
  last: boolean | undefined;
  rightAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  title?: string;
}> = ({ style, claim, last, rightAccessory, testID, title }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.dataItem,
        { borderColor: colorScheme.lighterGrey },
        last && styles.dataItemLast,
        style,
      ]}
      testID={testID}
    >
      <View style={styles.dataItemLeft}>
        <Typography
          color={colorScheme.textSecondary}
          size="sml"
          style={styles.dataItemLabel}
        >
          {title ?? claim?.key}
        </Typography>
        {claim ? (
          <ClaimValue claim={claim} testID={concatTestID(testID, 'value')} />
        ) : (
          <Typography color={colorScheme.alertText}>
            {translate('proofRequest.missingAttribute')}
          </Typography>
        )}
      </View>
      {rightAccessory}
    </View>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingBottom: 4,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  dataItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  dataItemLeft: {
    flex: 1,
  },
});
