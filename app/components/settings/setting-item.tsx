import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, {
  ComponentType,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  useMemo,
} from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  label: {
    flex: 1,
    marginBottom: 0,
    marginTop: 0,
  },
  wrapper: {
    paddingHorizontal: 24,
  },
});

export type SettingItemProps = {
  icon?: ComponentType<any> | ReactElement;
  style?: StyleProp<ViewStyle>;
  title: string;
};

const SettingItem: FunctionComponent<PropsWithChildren<SettingItemProps>> = ({
  title,
  icon,
  style,
  children,
}) => {
  const colorScheme = useAppColorScheme();
  const iconView: React.ReactElement | undefined = useMemo(() => {
    if (!icon) {
      return undefined;
    }
    if (React.isValidElement(icon)) {
      return icon;
    } else {
      const IconComponent = icon as React.ComponentType<any>;
      return <IconComponent />;
    }
  }, [icon]);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.container,
          { borderBottomColor: colorScheme.background },
        ]}
      >
        {iconView && (
          <View
            style={[styles.icon, { backgroundColor: colorScheme.background }]}
          >
            {iconView}
          </View>
        )}
        <Typography
          accessible={false}
          color={colorScheme.text}
          preset="s"
          style={styles.label}
        >
          {title}
        </Typography>
        {children}
      </View>
    </View>
  );
};

export default SettingItem;
