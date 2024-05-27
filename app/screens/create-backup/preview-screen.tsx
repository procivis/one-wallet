import {
  Button,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useBackupInfo } from '../../hooks/core/backup';
import { useCredentials } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import {
  CreateBackupProcessingNavigationProp,
  CreateBackupProcessingRouteProp,
} from '../../navigators/create-backup/create-backup-processing-routes';

const longPressTimeSeconds = 3;

const PreviewScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<CreateBackupProcessingNavigationProp<'Preview'>>();
  const { params } = useRoute<CreateBackupProcessingRouteProp<'Preview'>>();
  const { data: credentials } = useCredentials();
  const { data: backupInfo } = useBackupInfo();
  const nonExportableCredentials = backupInfo?.credentials;

  const exportableCredentials = credentials?.filter(
    (credential) =>
      !nonExportableCredentials?.find(
        (nonExportableCredential) =>
          nonExportableCredential.id === credential.id,
      ),
  );

  const onConfirm = useCallback(() => {
    navigation.replace('Creating', params);
  }, [navigation, params]);

  const showExportable =
    exportableCredentials && exportableCredentials.length > 0;
  const showNonExportable =
    nonExportableCredentials && nonExportableCredentials.length > 0;

  return (
    <ScrollViewScreen
      header={{
        leftItem: <HeaderCloseModalButton onPress={navigation.goBack} />,
        modalHandleVisible: Platform.OS === 'ios',
        static: true,
        title: translate('createBackup.preview.title'),
      }}
      modalPresentation
      testID="CreateBackupPreviewScreen"
    >
      <View style={styles.content} testID="CreateBackupPreviewScreen.content">
        <Typography color={colorScheme.text} style={styles.description}>
          {translate('createBackup.preview.description')}
        </Typography>

        {showExportable && (
          <Typography
            color={colorScheme.text}
            preset="m"
            style={styles.sectionHeader}
          >
            {translate('createBackup.preview.backedUp')}
          </Typography>
        )}
        {showExportable && (
          <PreviewCredentials credentials={exportableCredentials} />
        )}

        {showNonExportable && (
          <Typography
            color={colorScheme.text}
            preset="m"
            style={styles.sectionHeader}
          >
            {translate('createBackup.preview.notBackedUp')}
          </Typography>
        )}
        {showNonExportable && (
          <PreviewCredentials credentials={nonExportableCredentials} />
        )}
      </View>
      <View style={styles.bottom}>
        <Button
          delayLongPress={longPressTimeSeconds * 1000}
          onLongPress={onConfirm}
          subtitle={translate('common.holdButton', {
            seconds: longPressTimeSeconds,
          })}
          testID="CreateBackupPreviewScreen.mainButton"
          title={translate('createBackup.preview.cta')}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  description: {
    marginBottom: 20,
    marginTop: 12,
  },
  sectionHeader: {
    marginHorizontal: 4,
    marginVertical: 16,
  },
});

export default PreviewScreen;
