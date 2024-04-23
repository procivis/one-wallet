import {
  Button,
  ButtonType,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useClipboard } from '@react-native-clipboard/clipboard';
import React, { FunctionComponent } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
  value: string;
}> = ({ value, link, copy }) => {
  const [, setString] = useClipboard();

  if (copy) {
    return (
      <TouchableOpacity onPress={() => setString(value)}>
        <CopyContentIcon />
      </TouchableOpacity>
    );
  } else if (link) {
    return (
      <TouchableOpacity onPress={() => Linking.openURL(link)}>
        <OpenLinkIcon />
      </TouchableOpacity>
    );
  } else {
    return null;
  }
};

const TextWithHighlight: FunctionComponent<{
  highlightedText: string;
  text: string;
}> = ({ highlightedText, text }) => {
  const colorScheme = useAppColorScheme();
  return (
    <Typography
      color={colorScheme.white}
      preset="s/code"
      style={styles.attributeValue}
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
    >
      <Typography
        color={colorScheme.nerdView.attributeLabel}
        preset="s/code"
        style={styles.attributeLabel}
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
            text={previewText}
          />
        )}
        {canBeCopied || link ? (
          <View style={styles.actionIcon}>
            <ActionIcon
              copy={canBeCopied}
              link={link}
              value={`${highlightedText}${attributeText}`}
            />
          </View>
        ) : null}
      </View>
      {expandable ? (
        <Button
          onPress={() => setExpanded(!expanded)}
          style={styles.expandValueButton}
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
