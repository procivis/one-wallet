import {
  Selector,
  SelectorStatus,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import React, { FunctionComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';

export const ProofRequestAttribute: FunctionComponent<{
  attribute: string;
  last?: boolean;
  onPress?: () => void;
  status: SelectorStatus;
  value: string | undefined;
}> = ({ attribute, value, last, status, onPress }) => {
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
        <Typography color={value ? colorScheme.text : colorScheme.alertText}>
          {value ?? translate('proofRequest.missingAttribute')}
        </Typography>
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
