import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

export type ListTitleHeaderProps = {
  title: string;
};

const ListTitleHeader: FC<ListTitleHeaderProps> = ({ title }) => {
  const colorScheme = useAppColorScheme();

  return (
    <Typography
      accessibilityRole="header"
      color={colorScheme.text}
      preset="l"
      style={styles.listTitle}
    >
      {title}
    </Typography>
  );
};

const styles = StyleSheet.create({
  listTitle: {
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 9,
  },
});

export default ListTitleHeader;
