import {
  concatTestID,
  Selector,
  SelectorStatus,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC, memo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useCurrentLanguage } from '../../hooks/language';
import { DocumentSigner } from '../../models/wallet-store/wallet-store';

interface CredentialRequestListItemProps {
  isSelected: boolean;
  onPress: () => void;
  provider: DocumentSigner;
  testID?: string;
}

const CredentialRequestListItem: FC<CredentialRequestListItemProps> = ({
  testID,
  provider,
  onPress,
  isSelected,
}) => {
  const colorScheme = useAppColorScheme();
  const language = useCurrentLanguage();

  const status = isSelected
    ? SelectorStatus.SelectedRadio
    : SelectorStatus.Empty;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.wrapper, { backgroundColor: colorScheme.background }]}
      testID={testID}
    >
      <Image
        source={{ uri: provider.logo }}
        style={styles.icons}
        testID={concatTestID(testID, 'image')}
      />

      <View style={styles.labels}>
        <Typography
          color={colorScheme.text}
          numberOfLines={1}
          preset="s"
          style={styles.title}
          testID={concatTestID(testID, 'label')}
        >
          {provider.displayName.find((l) => l.lang === language)?.value}
        </Typography>
        <Typography
          color={colorScheme.text}
          numberOfLines={1}
          preset="s"
          style={styles.description}
          testID={concatTestID(testID, 'description')}
        >
          {provider.description.find((l) => l.lang === language)?.value}
        </Typography>
      </View>
      <Selector status={status} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  description: {
    fontWeight: 500,
  },
  icons: {
    borderRadius: 4,
    height: 32,
    marginRight: 16,
    width: 32,
  },
  labels: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontWeight: 500,
  },

  wrapper: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
  },
});

export default memo(CredentialRequestListItem);
