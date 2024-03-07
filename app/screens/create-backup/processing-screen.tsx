import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import DocumentPicker from 'react-native-document-picker';
import { DocumentDirectoryPath, moveFile } from 'react-native-fs';

import { useCreateBackup } from '../../hooks/backup';
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
  const fileName = useRef<string>(getBackupFileName());

  useBlockOSBackNavigation();

  const handleBackupCreate = useCallback(async () => {
    try {
      await createBackup({
        outputPath: `${DocumentDirectoryPath}/${fileName.current}`,
        password: recoveryPassword,
      });
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Backup creation failure');
      setState(LoadingResultState.Failure);
    }
  }, [createBackup, recoveryPassword]);

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
    const directory = await DocumentPicker.pickDirectory();
    if (directory) {
      try {
        await moveFile(
          `${DocumentDirectoryPath}/${fileName.current}`,
          decodeURIComponent(`${directory.uri}${fileName.current}`),
        );
      } catch (e) {
        reportException(e, 'Backup move failure');
        setState(LoadingResultState.Failure);
        return;
      }
    }
    navigation.navigate('Dashboard');
  }, [navigation]);

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
