import {
  Typography,
  TypographyProps,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

export type ListSectionHeaderProps = Partial<TypographyProps> & {
  title: string;
};

const ListSectionHeder: FC<ListSectionHeaderProps> = ({
  accessibilityRole,
  color,
  style,
  title,
  ...typographyProps
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <Typography
      accessibilityRole={accessibilityRole ?? 'header'}
      color={color ?? colorScheme.text}
      style={[styles.sectionHeader, style]}
      {...typographyProps}
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
