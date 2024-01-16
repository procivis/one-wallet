import {
  Selector,
  SelectorStatus,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { Claim } from '@procivis/react-native-one-core';
import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { ClaimValue } from '../credential/claim-value';

export const ProofRequestAttribute: FunctionComponent<{
  attribute: string;
  claim: Claim | undefined;
  last?: boolean;
  onPress?: () => void;
  status: SelectorStatus;
}> = ({ attribute, claim, last, status, onPress }) => {
  const colorScheme = useAppColorScheme();
  const selector = <Selector status={status} />;
  return (
    <View
      style={[
        styles.dataItem,
        last && styles.dataItemLast,
        { borderColor: colorScheme.lighterGrey },
      ]}
    >
      <View style={styles.dataItemLeft}>
        <Typography
          color={colorScheme.textSecondary}
          size="sml"
          style={styles.dataItemLabel}
        >
          {attribute}
        </Typography>
        {claim ? (
          <ClaimValue claim={claim} />
        ) : (
          <Typography color={colorScheme.alertText}>
            {translate('proofRequest.missingAttribute')}
          </Typography>
        )}
      </View>
      {selector && onPress ? (
        <TouchableOpacity accessibilityRole="button" onPress={onPress}>
          {selector}
        </TouchableOpacity>
      ) : (
        selector
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dataItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  dataItemLast: {
    borderBottomWidth: 0,
    marginBottom: 6,
  },
  dataItemLeft: {
    flex: 1,
  },
});
