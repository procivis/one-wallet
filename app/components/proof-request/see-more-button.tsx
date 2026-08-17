import {
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';

export type SeeMoreButtonProps = {
  expanded: boolean;
  onPress: () => void;
};

const SeeMoreButton: FC<SeeMoreButtonProps> = ({ expanded, onPress }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View>
      <View
        style={[styles.separator, { backgroundColor: colorScheme.accentText }]}
      />
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <Typography align="center" color={colorScheme.text}>
          {expanded ? translate('common.seeLess') : translate('common.seeMore')}
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingBottom: 10,
    paddingTop: 16,
    width: '100%',
  },
  separator: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
});

export default SeeMoreButton;
