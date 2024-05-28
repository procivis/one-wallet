import {
  concatTestID,
  HistoryStatusAcceptedIcon,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { Options, passwordStrength, Result } from 'check-password-strength';
import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { PurposeInfoIcon } from '../icon/purpose-icon';

export interface PasswordStrengthProps {
  password: string;
  testID?: string;
}

enum Tip {
  Length = 'length',
  Number = 'number',
  Symbol = 'symbol',
  Upper = 'upper',
}
const TIPS = [Tip.Length, Tip.Upper, Tip.Number, Tip.Symbol];

type Levels = '0' | '1' | '2' | '3' | '4';
const OPTIONS: Options<Levels> = [
  {
    id: 1,
    minDiversity: 0,
    minLength: 0,
    value: '1',
  },
  {
    id: 2,
    minDiversity: 2,
    minLength: 6,
    value: '2',
  },
  {
    id: 3,
    minDiversity: 4,
    minLength: 8,
    value: '3',
  },
  {
    id: 4,
    minDiversity: 4,
    minLength: 10,
    value: '4',
  },
];

const EMPTY_PASSWORD: Result<Levels> = {
  contains: [],
  id: 0,
  length: 0,
  value: '0',
};

export const PasswordStrength: FC<PasswordStrengthProps> = ({
  password,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const strength = useMemo(
    () => (password ? passwordStrength(password, OPTIONS) : EMPTY_PASSWORD),
    [password],
  );
  const tipsFullfilled = useMemo<Record<Tip, boolean>>(() => {
    return {
      [Tip.Length]: strength.length >= 8,
      [Tip.Number]: strength.contains.includes('number'),
      [Tip.Symbol]: strength.contains.includes('symbol'),
      [Tip.Upper]: strength.contains.includes('uppercase'),
    };
  }, [strength]);
  return (
    <>
      <View style={styles.strengthIndicators}>
        {Array.from({ length: TIPS.length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              !index && styles.firstIndicator,
              {
                backgroundColor:
                  strength.id > index
                    ? colorScheme.accent
                    : colorScheme.grayDark,
              },
            ]}
            testID={concatTestID(
              testID,
              'indicator',
              index.toString(),
              strength.id > index ? 'satisfied' : 'unsatisfied',
            )}
          />
        ))}
      </View>
      <Typography
        color="rgba(0, 0, 0, 0.5)"
        preset="xs"
        style={styles.passwordLevel}
      >
        {translate(`passwordStrength.level.${strength.value}`)}
      </Typography>
      <View style={[styles.tips, { backgroundColor: colorScheme.background }]}>
        <View style={styles.tipTitle}>
          <View style={styles.tipIcon}>
            <PurposeInfoIcon />
          </View>
          <Typography color={colorScheme.text} preset="s">
            {translate('passwordStrength.tip.title')}
          </Typography>
        </View>
        {TIPS.map((tip) => {
          const fullfilled = tipsFullfilled[tip];
          return (
            <View key={tip} style={styles.tipItem}>
              <View style={styles.tipIcon}>
                {fullfilled && (
                  <HistoryStatusAcceptedIcon
                    style={styles.successIcon}
                    testID={concatTestID(testID, tip, 'successIcon')}
                  />
                )}
              </View>
              <Typography
                color={fullfilled ? 'rgba(0, 0, 0, 0.5)' : colorScheme.text}
                preset="xs"
                testID={concatTestID(testID, tip, 'tip')}
              >
                {translate(`passwordStrength.tip.${tip}`)}
              </Typography>
            </View>
          );
        })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  firstIndicator: {
    marginLeft: 0,
  },
  indicator: {
    flex: 1,
    height: 4,
    marginLeft: 4,
  },
  passwordLevel: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  strengthIndicators: {
    flexDirection: 'row',
    width: '100%',
  },
  successIcon: {
    marginLeft: 2,
  },
  tipIcon: {
    width: 30,
  },
  tipItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },
  tipTitle: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  tips: {
    borderRadius: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
