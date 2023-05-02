import { Button, P, Title, useAppColorScheme } from '@procivis/react-native-components';
import React, { ErrorInfo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '../../components';
import { translate } from '../../i18n';

const styles = StyleSheet.create({
  buttonReset: {
    paddingHorizontal: 40,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    padding: 16,
    paddingVertical: 50,
  },
  contentError: {
    fontWeight: 'bold',
    paddingVertical: 15,
  },
  errorDetails: {
    borderRadius: 6,
    marginVertical: 15,
    maxHeight: '60%',
    paddingBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
  },
  friendlySubtitle: {
    fontWeight: 'normal',
    paddingVertical: 15,
  },
  icon: {
    height: 64,
    marginTop: 30,
    width: 64,
  },
  titleError: {
    fontWeight: 'bold',
    paddingVertical: 15,
  },
});

export interface ErrorComponentProps {
  error: Error;
  errorInfo: ErrorInfo;
  onReset(): void;
}

/**
 * Describe your component here
 */
export const ErrorComponent = (props: ErrorComponentProps) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.container, { backgroundColor: colorScheme.white }]}>
      <Icon style={styles.icon} icon="bug" />
      <Title style={styles.titleError} color={colorScheme.alertText}>
        {translate('errorScreen.title')}
      </Title>
      <P style={styles.friendlySubtitle} color={colorScheme.text}>
        {translate('errorScreen.friendlySubtitle')}
      </P>
      <View style={[styles.errorDetails, { backgroundColor: colorScheme.lighterGrey }]}>
        <ScrollView>
          <P style={styles.contentError} color={colorScheme.alertText}>
            {String(props.error)}
          </P>
        </ScrollView>
      </View>
      <Button style={styles.buttonReset} onPress={props.onReset}>
        <P color={colorScheme.text}>{translate('errorScreen.reset')}</P>
      </Button>
    </View>
  );
};
