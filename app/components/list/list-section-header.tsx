import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

export type ListSectionHeaderProps = {
  title: string;
};

const ListSectionHeder: FC<ListSectionHeaderProps> = ({ title }) => {
  const colorScheme = useAppColorScheme();
  return (
    <Typography
      accessibilityRole="header"
      color={colorScheme.text}
      style={styles.sectionHeader}
    >
      {title}
    </Typography>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
});

export default ListSectionHeder;
