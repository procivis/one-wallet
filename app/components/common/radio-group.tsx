import {
  Selector,
  SelectorStatus,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent } from 'react';
import {
  FlatList,
  FlatListProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { translate } from '../../i18n';

export type RadioGroupItem = {
  key: React.Key;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export interface RadioGroupProps {
  containerStyle?: StyleProp<ViewStyle>;
  items: RadioGroupItem[];
  listFooter?: FlatListProps<RadioGroupItem>['ListFooterComponent'];
  listFooterStyle?: FlatListProps<RadioGroupItem>['ListFooterComponentStyle'];
  onEndReached?: FlatListProps<RadioGroupItem>['onEndReached'];
  onSelected: (item: RadioGroupItem, index: number) => void;
  selectedItem?: React.Key;
  style?: StyleProp<ViewStyle>;
}

const RadioGroup: FunctionComponent<RadioGroupProps> = ({
  containerStyle,
  items,
  selectedItem,
  onSelected,
  style,
  listFooter,
  listFooterStyle,
  onEndReached,
}) => {
  const colorScheme = useAppColorScheme();

  return (
    <FlatList<RadioGroupItem>
      ListFooterComponent={listFooter}
      ListFooterComponentStyle={listFooterStyle}
      contentContainerStyle={containerStyle}
      data={items}
      onEndReached={onEndReached}
      renderItem={({ item, index }) => {
        const selected = selectedItem === item.key;
        return (
          <React.Fragment key={item.key}>
            <TouchableOpacity
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityValue={
                items.length > 1
                  ? {
                      text: translate('accessibility.control.order', {
                        current: index + 1,
                        length: items.length,
                      }),
                    }
                  : undefined
              }
              activeOpacity={selected ? 1 : undefined}
              onPress={() => {
                onSelected(item, index);
              }}
              style={[styles.item, item.style]}
            >
              <Typography color={colorScheme.text}>{item.label}</Typography>
              <Selector
                status={
                  selected ? SelectorStatus.SelectedRadio : SelectorStatus.Empty
                }
                style={styles.selector}
              />
            </TouchableOpacity>
            <View
              style={[
                styles.divider,
                { backgroundColor: colorScheme.background },
              ]}
            />
          </React.Fragment>
        );
      }}
      showsVerticalScrollIndicator={false}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    width: '100%',
  },
  selector: {
    marginLeft: 4,
    paddingTop: 0,
  },
});

export default RadioGroup;
