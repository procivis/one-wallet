import {
  Button,
  ButtonType,
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Dimensions, Linking, StyleSheet, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { CopyContentIcon, OpenLinkIcon } from '../icon/nerd-view-icon';

const VALUE_PREVIEW_LENGTH = 80;

// The onExpand and expandedAttributes props are used to notify other expanded fields
// that the layout (and thus the scrollOffset / icon position) has changed. This
// will trigger a view measurement and repositioning of the icon on all expanded fields.

export type NerdModeItemProps = {
  attributeKey: string;
  attributeText?: string;
  canBeCopied?: boolean;
  element?: React.ReactElement;
  expandedAttributes?: number;
  highlightedText?: string;
  last?: boolean;
  link?: string;
  onExpand?: (expanded: boolean) => void;
  scrollOffset?: SharedValue<number>;
  testID?: string;
};

const styles = StyleSheet.create({
  actionIcon: {
    alignItems: 'center',
    flex: 0.15,
    height: 48,
    justifyContent: 'center',
  },
  attributeLabel: {
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  attributeValue: {
    flex: 0.85,
    flexGrow: 1,
  },
  attributeValueContainer: {
    borderRadius: 2,
    borderWidth: 0.2,
    flexDirection: 'row',
    padding: 8,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  expandValueButton: {
    borderRadius: 4,
    borderWidth: 0,
    marginTop: 4,
  },
  lastAttribute: {
    paddingBottom: 30,
  },
});

const ICON_HEIGHT = 48;

export const ActionIcon: FunctionComponent<{
  copy?: boolean;
  link?: string;
  style?: ViewStyle;
  testID?: string;
  value: string;
}> = ({ value, link, testID, copy }) => {
  const copyToClipboard = useCopyToClipboard();
  const handleCopy = useCallback(() => {
    copyToClipboard(value);
  }, [copyToClipboard, value]);

  const openLink = useCallback(() => {
    if (link) {
      Linking.openURL(link);
    }
  }, [link]);

  if (copy) {
    return (
      <TouchableOpacity onPress={handleCopy} testID={testID}>
        <CopyContentIcon />
      </TouchableOpacity>
    );
  }

  if (link) {
    return (
      <TouchableOpacity onPress={openLink} testID={testID}>
        <OpenLinkIcon />
      </TouchableOpacity>
    );
  }

  return null;
};

const TextWithHighlight: FunctionComponent<{
  highlightedText: string;
  testID: string;
  text: string;
}> = ({ highlightedText, testID, text }) => {
  const colorScheme = useAppColorScheme();
  return (
    <Typography
      color={colorScheme.white}
      preset="s/code"
      style={styles.attributeValue}
      testID={testID}
    >
      <Typography
        color={colorScheme.nerdView.codeHighlightText}
        preset="s/code"
      >
        {highlightedText}
      </Typography>
      {text}
    </Typography>
  );
};

const NerdModeItem: FunctionComponent<NerdModeItemProps> = ({
  highlightedText = '',
  attributeText = '',
  attributeKey,
  link,
  canBeCopied,
  onExpand,
  expandedAttributes,
  last = false,
  scrollOffset,
  element,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const valueViewRef = React.useRef<View>(null);

  const expandedView = useSharedValue({
    expandedAtOffset: 0,
    viewHeight: 0,
    viewStart: 0,
  });

  const expandable = attributeText.length > VALUE_PREVIEW_LENGTH;
  const [expanded, setExpanded] = useState(!expandable);

  const screenMiddle = useMemo(() => Dimensions.get('screen').height / 2, []);

  const iconTopPosition = useDerivedValue(() => {
    if (!expanded || !expandable || !scrollOffset) {
      return expandedView.value.viewHeight / 2 - ICON_HEIGHT / 2;
    }

    const viewEnd =
      expandedView.value.viewStart + expandedView.value.viewHeight;
    let zeroedOffset = scrollOffset.value - expandedView.value.expandedAtOffset;

    if (expandedView.value.viewStart > screenMiddle) {
      zeroedOffset =
        zeroedOffset -
        (expandedView.value.viewStart - screenMiddle + ICON_HEIGHT / 2);
    } else {
      if (viewEnd < screenMiddle + ICON_HEIGHT) {
        zeroedOffset =
          zeroedOffset +
          (screenMiddle - expandedView.value.viewStart - ICON_HEIGHT / 2);
      } else if (
        expandedView.value.viewStart < screenMiddle &&
        viewEnd > screenMiddle
      ) {
        zeroedOffset =
          zeroedOffset +
          (screenMiddle - expandedView.value.viewStart - ICON_HEIGHT / 2);
      }
    }

    return clamp(
      zeroedOffset,
      0,
      expandedView.value.viewHeight - ICON_HEIGHT - 8,
    );
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: iconTopPosition.value,
        },
      ],
    };
  });

  const previewText = expanded
    ? attributeText
    : attributeText.slice(0, VALUE_PREVIEW_LENGTH) + '...';

  useEffect(() => {
    if (!scrollOffset) {
      return;
    }

    setTimeout(() => {
      valueViewRef.current?.measure((x, y, w, h, px, py) => {
        expandedView.value = {
          expandedAtOffset: scrollOffset.value,
          viewHeight: h,
          viewStart: py,
        };
      });
    }, 0);
    // We only recompute when any attribute is expanded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedAttributes]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme.nerdView.attributeSectionBackground },
        last ? styles.lastAttribute : {},
      ]}
      testID={testID}
    >
      <Typography
        color={colorScheme.nerdView.attributeLabel}
        preset="s/code"
        style={styles.attributeLabel}
        testID={concatTestID(testID, 'attributeLabel')}
      >
        {attributeKey}
      </Typography>
      <View
        ref={valueViewRef}
        style={[
          styles.attributeValueContainer,
          {
            backgroundColor: colorScheme.nerdView.attributeValueBackground,
            borderColor: colorScheme.nerdView.attributeValueBorder,
          },
        ]}
      >
        {element ? (
          element
        ) : (
          <TextWithHighlight
            highlightedText={highlightedText}
            testID={concatTestID(testID, 'attributeValue')!}
            text={previewText}
          />
        )}
        {canBeCopied || link ? (
          <Animated.View style={[styles.actionIcon, iconStyle]}>
            {
              <ActionIcon
                copy={canBeCopied}
                link={link}
                testID={concatTestID(testID, 'actionIcon')}
                value={`${highlightedText}${attributeText}`}
              />
            }
          </Animated.View>
        ) : null}
      </View>
      {expandable ? (
        <Button
          onPress={() => {
            onExpand && onExpand(!expanded);
            setExpanded(!expanded);
          }}
          style={styles.expandValueButton}
          testID={concatTestID(testID, 'expandValueButton')}
          title={
            expanded
              ? translate('nerdView.action.collapseAttribute')
              : translate('nerdView.action.expandAttribute')
          }
          type={ButtonType.SmallTech}
        />
      ) : null}
    </View>
  );
};

export default NerdModeItem;
