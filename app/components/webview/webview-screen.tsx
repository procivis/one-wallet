import {
  LoaderView,
  LoaderViewState,
  NavigationHeader,
  NavigationHeaderProps,
  useAppColorScheme,
  useListContentInset,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewNavigation } from 'react-native-webview';

export type WebViewScreenProps = ViewProps & {
  header: Omit<
    NavigationHeaderProps,
    'animate' | 'blurred' | 'style' | 'title' | 'titleVisible'
  > & {
    title: string;
  };
  modalPresentation?: boolean;
  onNavigationStateChange?: (event: WebViewNavigation) => void;
  originWhitelist?: string[];
  uri: string;
};

const WebViewScreen: FC<WebViewScreenProps> = ({
  header,
  modalPresentation,
  onNavigationStateChange,
  originWhitelist,
  style,
  testID,
  uri,
  ...viewProps
}) => {
  const colorScheme = useAppColorScheme();
  const { top } = useSafeAreaInsets();
  const contentInsetsStyle = useListContentInset({
    additionalBottomPadding: 24,
    headerHeight: modalPresentation && Platform.OS === 'ios' ? 63 : 48,
    modalPresentation,
  });
  const contentInset = {
    bottom: (contentInsetsStyle.paddingBottom as number) ?? undefined,
    top: (contentInsetsStyle.paddingTop as number) ?? undefined,
  };

  let headerPaddingStyle: ViewStyle | undefined;
  if (!modalPresentation || Platform.OS === 'android') {
    headerPaddingStyle = {
      paddingTop: top,
    };
  } else if (
    modalPresentation &&
    !header.modalHandleVisible &&
    Platform.OS === 'ios'
  ) {
    headerPaddingStyle = styles.modalHeaderWithoutHandle;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme.background },
        style,
      ]}
      testID={testID}
      {...viewProps}
    >
      <WebView
        allowsInlineMediaPlayback={true}
        containerStyle={styles.content}
        contentInset={contentInset}
        geolocationEnabled={true}
        onNavigationStateChange={onNavigationStateChange}
        originWhitelist={originWhitelist || ['*']}
        renderLoading={() => (
          <View style={styles.loader}>
            <LoaderView animate={true} state={LoaderViewState.InProgress} />
          </View>
        )}
        source={{ uri }}
        startInLoadingState={true}
        webviewDebuggingEnabled={__DEV__}
      />
      <NavigationHeader
        animate
        blurred
        style={[styles.header, headerPaddingStyle]}
        titleVisible={true}
        {...header}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    width: '100%',
  },
  loader: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  modalHeaderWithoutHandle: {
    paddingTop: 15,
  },
});

export default WebViewScreen;
