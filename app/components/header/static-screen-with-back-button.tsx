import { theme } from '@procivis/react-native-components';
import React, { FunctionComponent } from 'react';
import { Insets, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackButton from '../button/back-button';

type BackButtonProps = React.ComponentProps<typeof BackButton>;
export interface Props {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backButtonHandler: BackButtonProps['onPress'] | 'noBackButton';
  backButtonType?: BackButtonProps['type'];
}

const hitSlop: Insets = { top: 12, left: theme.padding, bottom: 12, right: theme.padding };

/**
 * Unified static screen component with optional back-button
 *
 * Following the design: https://www.figma.com/file/lmgEMiodW9VjCHSFCsBKcC/Procivis-SSI%2B-%E2%80%93-App-(Base-File)?node-id=3%3A4607
 */
const StaticScreenWithBackButton: FunctionComponent<Props> = ({
  children,
  style,
  contentStyle,
  backButtonHandler,
  backButtonType,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, theme.padding);
  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      {backButtonHandler === 'noBackButton' ? null : (
        <View style={styles.backButtonWrapper}>
          <BackButton type={backButtonType} onPress={backButtonHandler} hitSlop={hitSlop} />
        </View>
      )}
      <View style={styles.contentWrapper}>
        <View style={[styles.content, { paddingBottom: bottomPadding }, contentStyle]}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButtonWrapper: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.padding,
    paddingVertical: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 528,
    paddingHorizontal: theme.padding,
  },
  contentWrapper: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
});

export default StaticScreenWithBackButton;
