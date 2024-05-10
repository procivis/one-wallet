import {
  concatTestID,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import font from '@procivis/one-react-native-components/src/text/font';
import React, {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Animated,
  Insets,
  LayoutChangeEvent,
  LayoutRectangle,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextInputSubmitEditingEventData,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const ClearIcon: FC = () => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg fill="none" height={24} viewBox="0 0 24 24" width={24}>
      <Circle cx="12" cy="12" fill={colorScheme.background} r="6" />
      <Path
        d="M12.6487 11.9359L14.7939 9.79069C14.843 9.74457 14.8709 9.68017 14.8709 9.61277C14.8709 9.54537 14.843 9.48097 14.7939 9.43485L14.438 9.06884C14.3355 8.98155 14.1847 8.98155 14.0822 9.06884L11.937 11.2141L9.79175 9.06884C9.6909 8.97705 9.53677 8.97705 9.43591 9.06884L9.0699 9.43485C8.97811 9.53571 8.97811 9.68984 9.0699 9.79069L11.2151 11.9359L9.0699 14.0811C8.9767 14.1853 8.9767 14.3429 9.0699 14.4471L9.43591 14.803C9.48203 14.8521 9.54643 14.88 9.61383 14.88C9.68123 14.88 9.74563 14.8521 9.79175 14.803L11.937 12.6476L14.0822 14.7928C14.1301 14.8425 14.1962 14.8706 14.2652 14.8706C14.3342 14.8706 14.4003 14.8425 14.4482 14.7928L14.804 14.437C14.8981 14.3354 14.8936 14.1772 14.7939 14.0811L12.6487 11.9359Z"
        fill={colorScheme.text}
      />
    </Svg>
  );
};

// difference between font sizes
const LABEL_SCALE_RATIO = 14 / 12;

export enum InputAccessory {
  Clear = 'clear',
}

const hitSlop: Insets = { bottom: 10, left: 10, right: 10, top: 10 };

export interface InputProps
  extends Omit<TextInputProps, 'editable' | 'onSubmitEditing' | 'style'> {
  accessory?: InputAccessory;
  accessoryAccessibilityLabel?: string;
  disabled?: boolean;
  error?: string;
  label: string;
  onAccessoryPress?: () => void;
  onSubmit?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Generic text input component
 * @see https://www.figma.com/file/Gd0Tj0234hxtl3HMcCJThW/App-Component-Library-(Design)?node-id=3%3A824&t=r7HhHF1rsNLmOBL2-4
 */
const Input = forwardRef<TextInput, InputProps>(
  (
    {
      value,
      label,
      accessory = InputAccessory.Clear,
      accessoryAccessibilityLabel,
      onAccessoryPress,
      onSubmit,
      onFocus,
      onBlur,
      disabled,
      error,
      style,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const colorScheme = useAppColorScheme();
    const { fontScale } = useWindowDimensions();

    const [focused, setFocused] = useState(false);
    const onFocusAction = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );
    const onBlurAction = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const onSubmitEditing = useCallback(
      (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
        onSubmit?.(e.nativeEvent.text),
      [onSubmit],
    );

    const accessoryIcon = useMemo(() => {
      switch (accessory) {
        case InputAccessory.Clear:
          return value && !disabled ? <ClearIcon /> : undefined;
      }
    }, [accessory, disabled, value]);

    const accessoryComponent = accessoryIcon ? (
      <TouchableOpacity
        accessibilityLabel={accessoryAccessibilityLabel}
        accessibilityRole="button"
        accessible={!disabled}
        disabled={disabled}
        hitSlop={hitSlop}
        onPress={onAccessoryPress}
        testID={concatTestID(props.testID, 'accessoryButton')}
      >
        {accessoryIcon}
      </TouchableOpacity>
    ) : null;

    const labelPosition = focused || value ? 0 : 1;
    const [labelAnimation] = useState<Animated.Value>(
      () => new Animated.Value(labelPosition),
    );
    useEffect(() => {
      Animated.timing(labelAnimation, {
        duration: 200,
        toValue: labelPosition,
        useNativeDriver: true,
      }).start();
    }, [labelAnimation, labelPosition]);

    const [labelLayout, setLabelLayout] = useState<LayoutRectangle>();
    const onLabelLayout = useCallback(
      (event: LayoutChangeEvent) => setLabelLayout(event.nativeEvent.layout),
      [],
    );

    const accessibilityLabel = disabled ? undefined : label;
    const inputStyle = { height: Math.min(2, fontScale) * 24 };

    const input = (
      <TextInput
        accessibilityLabel={accessibilityLabel}
        defaultValue={value || ''}
        editable={!disabled}
        hitSlop={hitSlop}
        maxFontSizeMultiplier={2}
        numberOfLines={1}
        onBlur={onBlurAction}
        onFocus={onFocusAction}
        onSubmitEditing={onSubmitEditing}
        placeholder={focused ? placeholder : undefined}
        ref={ref}
        returnKeyType="next"
        style={[
          font.regular,
          styles.inputText,
          Platform.OS === 'android' ? styles.inputAndroid : styles.inputIOS,
          {
            color: colorScheme.text,
          },
        ]}
        textAlignVertical="center"
        // https://github.com/facebook/react-native/issues/17530
        underlineColorAndroid="#00000000"
        value={value}
        {...props}
      />
    );
    return (
      <View style={style}>
        <Animated.View
          onLayout={onLabelLayout}
          style={
            labelLayout
              ? {
                  transform: [
                    {
                      // move label into the position of placeholder
                      translateY: labelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, labelLayout.height + 4],
                      }),
                    },
                    {
                      // compensate scale position in X direction
                      translateX: labelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          0,
                          (labelLayout.width * (LABEL_SCALE_RATIO - 1)) / 2,
                        ],
                      }),
                    },
                    {
                      // scale label into the size of placeholder
                      scale: labelAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, LABEL_SCALE_RATIO],
                      }),
                    },
                  ],
                }
              : undefined
          }
        >
          <Typography
            accessible={false}
            color={'rgba(0, 0, 0, 0.50)'}
            preset="s"
          >
            {label}
          </Typography>
        </Animated.View>
        <View
          style={[
            styles.inputRow,
            {
              borderColor: focused ? colorScheme.accent : colorScheme.grayDark,
            },
          ]}
        >
          {Platform.OS === 'android' ? (
            <View style={[styles.inputWrapperAndroid, inputStyle]}>
              {input}
            </View>
          ) : (
            input
          )}
          {accessoryComponent}
        </View>
        {error ? (
          <Typography color={colorScheme.error} preset="s">
            {error}
          </Typography>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  inputAndroid: {
    fontSize: 14,
    left: 0,
    letterSpacing: 0.2,
    lineHeight: 22,
    position: 'absolute',
    right: 0,
  },
  inputIOS: {
    flex: 1,
  },
  inputRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 4,
  },
  inputText: {
    fontSize: 14,
    letterSpacing: 0.2,
    lineHeight: Platform.OS === 'android' ? 22 : 20,
    minHeight: 24,
  },
  inputWrapperAndroid: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
  },
});

Input.displayName = 'Input';

export default Input;
