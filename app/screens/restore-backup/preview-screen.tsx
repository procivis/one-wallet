import {
  Button,
  NavigationHeader,
  Typography,
  useAppColorScheme,
  useBeforeRemove,
  useCredentials,
  useRollbackImport,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useRef } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import { RestoreBackupProcessingNavigationProp } from '../../navigators/restore-backup/restore-backup-processing-routes';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';

const longPressTimeSeconds = 3;

const PreviewScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Processing'>>();
  const processingNavigation =
    useNavigation<RestoreBackupProcessingNavigationProp<'Preview'>>();
  const colorScheme = useAppColorScheme();
  const { top } = useSafeAreaInsets();
  const { data: credentials } = useCredentials();
  const { mutateAsync: rollbackImport } = useRollbackImport();

  const skipRollback = useRef(false);
  const rollback = async () => {
    if (skipRollback.current) {
      return;
    }
    navigation.navigate('RestoreBackupDashboard');
    await rollbackImport();
  };
  useBeforeRemove(rollback);

  const onConfirm = useCallback(() => {
    skipRollback.current = true;
    processingNavigation.replace('Restore');
  }, [processingNavigation]);

  const onClose = useCallback(() => {
    navigation.navigate('RestoreBackupDashboard');
  }, [navigation]);

  const safeAreaPaddingStyle: ViewStyle | undefined =
    Platform.OS === 'android'
      ? {
          paddingTop: top,
        }
      : undefined;

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, safeAreaPaddingStyle]}
      style={styles.scrollView}
      testID="RestoreBackupPreviewScreen"
    >
      <NavigationHeader
        leftItem={
          <HeaderCloseModalButton
            onPress={onClose}
            testID="RestoreBackupPreviewScreen.header.close"
          />
        }
        modalHandleVisible={Platform.OS === 'ios'}
        title={translate('restoreBackup.preview.title')}
      />

      <View style={styles.content} testID="RestoreBackupPreviewScreen.content">
        <Typography
          align="center"
          color={colorScheme.text}
          style={styles.description}
        >
          {translate('restoreBackup.preview.description')}
        </Typography>
        <PreviewCredentials credentials={credentials} />
        <SafeAreaView edges={['bottom']} style={styles.bottom}>
          <Button
            delayLongPress={longPressTimeSeconds * 1000}
            onLongPress={onConfirm}
            subtitle={translate('common.holdButton', {
              seconds: longPressTimeSeconds,
            })}
            testID="RestoreBackupPreviewScreen.mainButton"
            title={translate('restoreBackup.preview.cta')}
          />
        </SafeAreaView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 16,
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginHorizontal: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
  description: {
    marginBottom: 20,
    marginTop: 28,
  },
  scrollView: {
    flex: 1,
  },
});

export default PreviewScreen;
