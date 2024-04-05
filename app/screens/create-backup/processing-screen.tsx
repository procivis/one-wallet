import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { DocumentDirectoryPath } from 'react-native-fs';

import { useCreateBackup } from '../../hooks/core/backup';
import { translate } from '../../i18n';
import {
  CreateBackupNavigationProp,
  CreateBackupRouteProp,
} from '../../navigators/create-backup/create-backup-routes';
import { getBackupFileName } from '../../utils/backup';
import { reportException } from '../../utils/reporting';

const ProcessingScreen: FC = () => {
  const navigation = useNavigation<CreateBackupNavigationProp<'Processing'>>();
  const route = useRoute<CreateBackupRouteProp<'Processing'>>();
  const { recoveryPassword } = route.params;
  const [state, setState] = useState<
    | LoadingResultState.InProgress
    | LoadingResultState.Success
    | LoadingResultState.Failure
  >(LoadingResultState.InProgress);
  const { mutateAsync: createBackup } = useCreateBackup();

  useBlockOSBackNavigation();

  const backupFileName = useMemo(() => getBackupFileName(), []);
  const backupFilePath = useMemo(
    () => `${DocumentDirectoryPath}/${backupFileName}`,
    [backupFileName],
  );

  const handleBackupCreate = useCallback(async () => {
    try {
      await createBackup({
        outputPath: backupFilePath,
        password: recoveryPassword,
      });
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Backup creation failure');
      setState(LoadingResultState.Failure);
    }
  }, [createBackup, recoveryPassword, backupFilePath]);

  useEffect(() => {
    handleBackupCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (state === LoadingResultState.InProgress) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Dashboard');
  }, [navigation, state]);

  const handleCta = useCallback(async () => {
    navigation.navigate('Dashboard', { backupFileName, backupFilePath });
  }, [backupFileName, backupFilePath, navigation]);

  return (
    <LoadingResult
      ctaButtonLabel={translate('createBackup.processing.success.cta')}
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onCTA={handleCta}
      onClose={state !== LoadingResultState.Success ? handleClose : undefined}
      state={state}
      subtitle={translate(`createBackup.processing.${state}.subtitle`)}
      successCloseButtonLabel={translate('common.close')}
      testID="CreateBackupProcessingScreen"
      title={translate(`createBackup.processing.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default ProcessingScreen;
