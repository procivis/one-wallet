import {
  HoldButton,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
  useBackupInfo,
  useCredentials,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import { omit } from 'lodash';
import React, { FC, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import {
  CreateBackupProcessingNavigationProp,
  CreateBackupProcessingRouteProp,
} from '../../navigators/create-backup/create-backup-processing-routes';

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
        leftItem: (
          <HeaderCloseModalButton
            onPress={navigation.goBack}
            testID="CreateBackupPreviewScreen.header.close"
          />
        ),
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
          <PreviewCredentials
            credentials={nonExportableCredentials?.map((credential) => {
              return {
                issuerDid: credential.issuerDid?.did,
                ...omit(credential, ['issuerDid', 'issuer']),
              };
            })}
          />
        )}
      </View>
      <View style={styles.bottom}>
        <HoldButton
          onFinished={onConfirm}
          style={{ backgroundColor: colorScheme.white }}
          subtitlePrefix={translate('common.holdButton.subtitlePrefix')}
          subtitleSuffix={translate('common.holdButton.subtitleSuffix')}
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
