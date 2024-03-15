import {
  Button,
  DetailScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { RootNavigationProp } from '../../navigators/root/root-routes';

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
  screenTitle: string;
  testID: string;
  title: string;
}>;

const BackupScreen: FC<BackupScreenProps> = ({
  children,
  cta,
  description,
  isCtaDisabled,
  onBack,
  onCta,
  screenTitle,
  testID,
  title,
}) => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp<'Settings'>>();

  const handleBack = () => {
    onBack?.();
    navigation.goBack();
  };

  return (
    <DetailScreen
      onBack={handleBack}
      style={styles.container}
      testID={testID}
      title={screenTitle}
    >
      <View style={styles.content}>
        <Typography
          accessibilityRole="header"
          bold={true}
          color={colorScheme.text}
          size="h1"
          style={styles.title}
        >
          {title}
        </Typography>

        <Typography color={colorScheme.text} style={styles.description}>
          {description}
        </Typography>

        {children}
      </View>

      <Button disabled={isCtaDisabled} onPress={onCta}>
        {cta}
      </Button>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
  description: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
});

export default BackupScreen;
