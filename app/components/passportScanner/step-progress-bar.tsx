import { P, theme, useAppColorScheme } from '@procivis/react-native-components';
import React, { FunctionComponent } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { translate } from '../../i18n';

const FinishedStepIcon: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={8} fill={colorScheme.accent} />
      <Path
        d="M7.35085 10.3899L4.71433 7.73247C4.65056 7.66117 4.65056 7.55333 4.71433 7.48203L4.96477 7.23855C5.03239 7.17227 5.14062 7.17227 5.20825 7.23855L7.35085 9.40899L11.4274 5.38116C11.4987 5.31739 11.6065 5.31739 11.6778 5.38116L11.9213 5.6316C11.9841 5.70061 11.9841 5.80607 11.9213 5.87508L7.35085 10.3899Z"
        stroke={colorScheme.accentText}
        strokeWidth={0.8}
        fill={colorScheme.accentText}
      />
    </Svg>
  );
};

const CurrentStepIcon: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.currentStepIconOuter, { backgroundColor: colorScheme.accent }]}>
      <View style={[styles.currentStepIconInner, { borderColor: colorScheme.white }]} />
    </View>
  );
};

const EmptyStepIcon: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  return <View style={[styles.emptyStepIcon, { backgroundColor: colorScheme.lighterGrey }]} />;
};

interface Props {
  curStep: number;
  numSteps: number;
  style?: StyleProp<ViewStyle>;
}

export const StepProgressBar: FunctionComponent<Props> = ({ curStep, numSteps, style }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.container, style]}>
      <P style={styles.title} color={colorScheme.text}>
        {translate('stepProgressBar.title', { curStep: Math.min(curStep, numSteps), numSteps })}
      </P>
      <View style={styles.progressBar}>
        {Array.from({ length: numSteps }, (_, index) => index + 1).map((step) => (
          <React.Fragment key={step}>
            {step > 1 && (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: step <= curStep ? colorScheme.accent : colorScheme.lighterGrey,
                  },
                ]}
              />
            )}
            {step < curStep ? <FinishedStepIcon /> : step === curStep ? <CurrentStepIcon /> : <EmptyStepIcon />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  currentStepIconInner: {
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  currentStepIconOuter: {
    alignItems: 'center',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  emptyStepIcon: {
    borderRadius: 4,
    height: 8,
    margin: 4,
    width: 8,
  },
  line: {
    flex: 1,
    height: 2,
  },
  progressBar: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  title: {
    marginBottom: theme.grid,
  },
});
