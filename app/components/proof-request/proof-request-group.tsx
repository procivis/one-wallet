import { Typography, useAppColorScheme } from '@procivis/react-native-components';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { PresentationDefinitionRequestGroup } from 'react-native-one-core';

export const ProofRequestGroup: FunctionComponent<
  PropsWithChildren<{
    request: PresentationDefinitionRequestGroup;
    last: boolean;
  }>
> = ({ request, last, children }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.group, last && styles.last, { borderColor: colorScheme.lighterGrey }]}>
      {request.name ? (
        <Typography color={colorScheme.text} size="sml" bold={true} style={styles.title}>
          {request.name}
        </Typography>
      ) : null}
      {request.purpose ? (
        <Typography color={colorScheme.textSecondary} size="sml" style={styles.subtitle}>
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
