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

type RadioGroupFlatListProps = FlatListProps<RadioGroupItem>;

export type RadioGroupItem = {
  disabled?: boolean;
  key: React.Key;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export interface RadioGroupProps {
  containerStyle?: StyleProp<ViewStyle>;
  items: RadioGroupItem[];
  listFooter?: RadioGroupFlatListProps['ListFooterComponent'];
  listFooterStyle?: RadioGroupFlatListProps['ListFooterComponentStyle'];
  multiselect?: boolean;
  onDeselected?: (item: RadioGroupItem, index: number) => void;
  onEndReached?: RadioGroupFlatListProps['onEndReached'];
  onEndReachedThreshold?: RadioGroupFlatListProps['onEndReachedThreshold'];
  onSelected: (item: RadioGroupItem, index: number) => void;
  selectedItems: React.Key[];
  showsVerticalScrollIndicator?: RadioGroupFlatListProps['showsVerticalScrollIndicator'];
  staticContent?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

const RadioGroup: FunctionComponent<RadioGroupProps> = ({
  containerStyle,
  title,
  items,
  multiselect,
  selectedItems,
  onSelected,
  onDeselected,
  style,
  listFooter,
  listFooterStyle,
  staticContent = true,
  onEndReachedThreshold,
  onEndReached,
  showsVerticalScrollIndicator = false,
}) => {
  const colorScheme = useAppColorScheme();

  return (
    <FlatList<RadioGroupItem>
      ListFooterComponent={listFooter}
      ListFooterComponentStyle={listFooterStyle}
      ListHeaderComponent={
        title ? (
          <Typography
            accessibilityRole="header"
            align="left"
            caps={true}
            color={colorScheme.text}
            style={styles.title}
          >
            {title}
          </Typography>
        ) : null
      }
      contentContainerStyle={containerStyle}
      data={items}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      renderItem={({ item, index }) => {
        const selected = selectedItems.includes(item.key);
        return (
          <React.Fragment key={item.key}>
            <TouchableOpacity
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ disabled: item.disabled, selected }}
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
              activeOpacity={selected && !multiselect ? 1 : undefined}
              disabled={item.disabled}
              onPress={() => {
                selected
                  ? multiselect
                    ? onDeselected?.(item, index)
                    : undefined
                  : onSelected(item, index);
              }}
              style={[styles.item, item.style]}
            >
              <Typography color={colorScheme.text}>{item.label}</Typography>
              <Selector
                status={
                  selected
                    ? multiselect
                      ? SelectorStatus.SelectedCheckmark
                      : SelectorStatus.SelectedRadio
                    : item.disabled
                    ? SelectorStatus.Disabled
                    : SelectorStatus.Empty
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
      scrollEnabled={!staticContent}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
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
  title: {
    marginBottom: 24,
    marginTop: 12,
  },
});

export default RadioGroup;
