import { Checkbox } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import BackupScreen from '../../components/backup/backup-screen';
import { Section } from '../../components/common/section';
import { Credential } from '../../components/credential/credential';
import { useRollbackImport } from '../../hooks/backup';
import { useCredentials } from '../../hooks/credentials';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { reportException } from '../../utils/reporting';

const PreviewScreen: FC = () => {
  const navigation = useNavigation<RestoreBackupNavigationProp<'Preview'>>();
  const { data: credentials } = useCredentials();
  const { mutateAsync: rollbackImport } = useRollbackImport();
  const [isConsentChecked, setIsConsentChecked] = useState<boolean>(false);

  const handleBack = async () => {
    try {
      await rollbackImport();
    } catch (e) {
      reportException(e, 'Backup rollbacking failure');
    }
  };

  return (
    <BackupScreen
      cta={translate('restoreBackup.preview.cta')}
      description={translate('restoreBackup.preview.description')}
      isCtaDisabled={!isConsentChecked}
      onBack={handleBack}
      onCta={() => navigation.navigate('Processing')}
      screenTitle={translate('restoreBackup.title')}
      testID="RestoreBackupPreviewScreen"
      title={translate('restoreBackup.preview.title')}
    >
      <View style={styles.content}>
        <Section
          style={styles.credentials}
          title={translate('createBackup.preview.backedUp')}
        >
          {credentials?.map((credential, index) => (
            <View
              key={credential.id}
              style={[
                styles.credential,
                index === credentials.length - 1 && styles.credentialLast,
              ]}
            >
              <Credential credentialId={credential.id} key={credential.id} />
            </View>
          ))}
        </Section>

        <Checkbox
          onValueChanged={setIsConsentChecked}
          text={translate('restoreBackup.preview.consent')}
          value={isConsentChecked}
        />
      </View>
    </BackupScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  credential: {
    marginBottom: 12,
  },
  credentialLast: {
    marginBottom: 0,
  },
  credentials: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});

export default PreviewScreen;
