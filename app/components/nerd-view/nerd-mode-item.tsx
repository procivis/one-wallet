import {
  Button,
  ButtonType,
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent, useCallback } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { CopyContentIcon, OpenLinkIcon } from '../icon/nerd-view-icon';

const VALUE_PREVIEW_LENGTH = 80;

export type NerdModeItemProps = {
  attributeKey: string;
  attributeText?: string;
  canBeCopied?: boolean;
  element?: React.ReactElement;
  highlightedText?: string;
  last?: boolean;
  link?: string;
  testID?: string;
};

const styles = StyleSheet.create({
  actionIcon: {
    alignItems: 'center',
    flex: 0.15,
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

const ActionIcon: FunctionComponent<{
  copy?: boolean;
  link?: string;
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
  last = false,
  element,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const expandable = attributeText.length > VALUE_PREVIEW_LENGTH;

  const [expanded, setExpanded] = React.useState(!expandable);

  const previewText = expanded
    ? attributeText
    : attributeText.slice(0, VALUE_PREVIEW_LENGTH) + '...';

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
          <View style={styles.actionIcon}>
            <ActionIcon
              copy={canBeCopied}
              link={link}
              testID={concatTestID(testID, 'actionIcon')}
              value={`${highlightedText}${attributeText}`}
            />
          </View>
        ) : null}
      </View>
      {expandable ? (
        <Button
          onPress={() => setExpanded(!expanded)}
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
