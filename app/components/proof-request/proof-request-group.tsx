import {
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { PresentationDefinitionRequestGroup } from '@procivis/react-native-one-core';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';

export const ProofRequestGroup: FunctionComponent<
  PropsWithChildren<{
    last: boolean;
    request: PresentationDefinitionRequestGroup;
  }>
> = ({ request, last, children }) => {
  const colorScheme = useAppColorScheme();
  const title = request.name ?? translate('proofRequest.attributes');
  return (
    <View
      style={[
        styles.group,
        last && styles.last,
        { borderColor: colorScheme.lighterGrey },
      ]}
    >
      <Typography
        accessibilityRole="header"
        bold={true}
        caps={true}
        color={colorScheme.text}
        size="sml"
        style={styles.title}
      >
        {title}
      </Typography>
      {request.purpose ? (
        <Typography
          color={colorScheme.textSecondary}
          size="sml"
          style={styles.subtitle}
        >
          {request.purpose}
        </Typography>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    borderBottomWidth: 1,
    marginVertical: 24,
  },
  last: {
    borderBottomWidth: 0,
  },
  subtitle: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 16,
  },
});
