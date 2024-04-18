import {
  Button,
  NavigationHeader,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
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
import { useRollbackImport } from '../../hooks/core/backup';
import { useCredentials } from '../../hooks/core/credentials';
import { useBeforeRemove } from '../../hooks/navigation/before-remove';
import { translate } from '../../i18n';
import { RestoreBackupProcessingNavigationProp } from '../../navigators/restore-backup/restore-backup-processing-routes';
import { reportException } from '../../utils/reporting';

const longPressTimeSeconds = 3;

const PreviewScreen: FC = () => {
  const navigation =
    useNavigation<RestoreBackupProcessingNavigationProp<'Preview'>>();
  const colorScheme = useAppColorScheme();
  const { top } = useSafeAreaInsets();
  const { data: credentials } = useCredentials();
  const { mutateAsync: rollbackImport } = useRollbackImport();

  const rollback = async () => {
    try {
      await rollbackImport();
    } catch (e) {
      reportException(e, 'Backup rollbacking failure');
    }
  };
  useBeforeRemove(rollback);

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
        leftItem={HeaderCloseModalButton}
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
        <PreviewCredentials
          credentials={credentials}
          fullWidth
          title={translate('restoreBackup.preview.backedUp')}
        />
        <SafeAreaView edges={['bottom']} style={styles.bottom}>
          <Button
            delayLongPress={longPressTimeSeconds * 1000}
            onLongPress={() => navigation.replace('Restore')}
            subtitle={translate('restoreBackup.preview.cta.subtitle', {
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
