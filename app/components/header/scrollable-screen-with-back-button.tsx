import { theme } from '@procivis/react-native-components';
import React, { FunctionComponent } from 'react';
import { Insets, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BackButton from '../../components/button/back-button';

type BackButtonProps = React.ComponentProps<typeof BackButton>;
type ScrollViewProps = React.ComponentProps<typeof ScrollView>;
export interface Props {
  scrollViewProps?: ScrollViewProps;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onBackPress: BackButtonProps['onPress'];
  backButtonType?: BackButtonProps['type'];
  footer?: React.ReactNode;
}

const hitSlop: Insets = { top: 12, left: theme.padding, bottom: 12, right: theme.padding };

/**
 * Unified scrollable screen component with back-button
 *
 * Following the design: https://www.figma.com/file/lmgEMiodW9VjCHSFCsBKcC/Procivis-SSI%2B-%E2%80%93-App-(Base-File)?node-id=24%3A13490
 */
const ScrollableScreenWithBackButton: FunctionComponent<Props> = ({
  children,
  scrollViewProps = {},
  style,
  contentStyle,
  onBackPress,
  backButtonType,
  footer,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, theme.padding);
  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: footer ? bottomPadding : undefined }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        style={styles.scrollView}
        {...scrollViewProps}>
        <View style={styles.backButtonWrapper}>
          <BackButton type={backButtonType} onPress={onBackPress} hitSlop={hitSlop} />
        </View>
        <View style={[styles.contentWrapper, { paddingBottom: footer ? undefined : bottomPadding }, contentStyle]}>
          {children}
        </View>
      </ScrollView>
      {footer}
    </View>
  );
};

const styles = StyleSheet.create({
  backButtonWrapper: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.padding,
    paddingVertical: theme.paddingM,
  },
  container: {
    height: '100%',
    width: '100%',
  },
  contentWrapper: {
    paddingHorizontal: theme.padding,
  },
  scrollView: {
    flex: 1,
  },
});

export default ScrollableScreenWithBackButton;
