import {
  BackButton,
  Button,
  ButtonType,
  concatTestID,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC, PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { HeaderBackButton } from '../navigation/header-buttons';
import ScrollViewScreen from '../screens/scroll-view-screen';

export enum BackupScreenMode {
  Create = 'create',
  Restore = 'restore',
}

type BackupScreenProps = PropsWithChildren<{
  cta: string;
  description: string;
  isCtaDisabled?: boolean;
  onBack?: () => void;
  onCta: () => void;
  testID: string;
  title: string;
}>;

export const BackupScreen: FC<BackupScreenProps> = ({
  children,
  cta,
  description,
  isCtaDisabled,
  onBack,
  onCta,
  testID,
  title,
}) => {
  const colorScheme = useAppColorScheme();

  const backButton = useMemo(() => {
    if (!onBack) {
      return HeaderBackButton;
    }
    return (
      <BackButton onPress={onBack} testID={concatTestID(testID, 'back')} />
    );
  }, [onBack, testID]);

  return (
    <ScrollViewScreen
      header={{
        backgroundColor: colorScheme.white,
        leftItem: backButton,
        title,
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID={testID}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <Typography color={colorScheme.text} style={styles.description}>
            {description}
          </Typography>

          {children}
        </View>

        <View style={styles.bottom}>
          <Button
            disabled={isCtaDisabled}
            onPress={onCta}
            testID={concatTestID(testID, 'mainButton')}
            title={cta}
            type={isCtaDisabled ? ButtonType.Border : ButtonType.Primary}
          />
        </View>
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 84,
  },
  content: {
    marginHorizontal: 8,
  },
  contentWrapper: {
    flex: 1,
    marginHorizontal: 12,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
});
