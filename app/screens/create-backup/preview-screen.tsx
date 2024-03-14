import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import BackupScreen from '../../components/backup/backup-screen';
import { Section } from '../../components/common/section';
import { Credential } from '../../components/credential/credential';
import { useBackupInfo } from '../../hooks/backup';
import { useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  CreateBackupNavigationProp,
  CreateBackupRouteProp,
} from '../../navigators/create-backup/create-backup-routes';

const PreviewScreen: FC = () => {
  const navigation = useNavigation<CreateBackupNavigationProp<'Preview'>>();
  const { params } = useRoute<CreateBackupRouteProp<'Preview'>>();
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

  return (
    <BackupScreen
      cta={translate('createBackup.preview.cta')}
      description={translate('createBackup.preview.description')}
      onCta={() => navigation.navigate('Processing', params)}
      screenTitle={translate('createBackup.title')}
      testID="CreateBackupPreviewScreen"
      title={translate('createBackup.preview.title')}
    >
      {exportableCredentials && exportableCredentials.length > 0 && (
        <Section
          style={styles.credentials}
          title={translate('createBackup.preview.backedUp')}
        >
          {exportableCredentials?.map((credential, index) => (
            <View
              key={credential.id}
              style={[styles.credential, index === 0 && styles.credentialFirst]}
            >
              <Credential credentialId={credential.id} key={credential.id} />
            </View>
          ))}
        </Section>
      )}

      {nonExportableCredentials && nonExportableCredentials.length > 0 && (
        <Section
          style={styles.credentials}
          title={translate('createBackup.preview.notBackedUp')}
        >
          {backupInfo?.credentials.map((credential, index) => (
            <View
              key={credential.id}
              style={[styles.credential, index === 0 && styles.credentialFirst]}
            >
              <Credential credentialId={credential.id} />
            </View>
          ))}
        </Section>
      )}
    </BackupScreen>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginTop: 12,
  },
  credentialFirst: {
    marginTop: 0,
  },
  credentials: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});

export default PreviewScreen;
