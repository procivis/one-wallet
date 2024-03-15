import {
  LoadingResult,
  LoadingResultState,
  LoadingResultVariation,
  useBlockOSBackNavigation,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { useFinalizeImport } from '../../hooks/backup';
import { translate } from '../../i18n';
import { RestoreBackupNavigationProp } from '../../navigators/restore-backup/restore-backup-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const ProcessingScreen: FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const navigation = useNavigation<RestoreBackupNavigationProp<'Processing'>>();
  const { mutateAsync: finalizeImport } = useFinalizeImport();
  const [state, setState] = useState<
    | LoadingResultState.InProgress
    | LoadingResultState.Success
    | LoadingResultState.Failure
  >(LoadingResultState.InProgress);

  useBlockOSBackNavigation();

  const handleBackupRestore = useCallback(async () => {
    try {
      await finalizeImport();
      setState(LoadingResultState.Success);
    } catch (e) {
      reportException(e, 'Backup restoring failure');
      setState(LoadingResultState.Failure);
    }
  }, [finalizeImport]);

  useEffect(() => {
    handleBackupRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    // TODO: implement possible restoring termination
    navigation.goBack();
  }, [navigation]);

  const handleCta = useCallback(() => {
    rootNavigation.navigate('Tabs', { screen: 'Wallet' });
  }, [rootNavigation]);

  return (
    <LoadingResult
      ctaButtonLabel={translate('restoreBackup.processing.success.cta')}
      failureCloseButtonLabel={translate('common.close')}
      inProgressCloseButtonLabel={translate('common.cancel')}
      onCTA={handleCta}
      onClose={state !== LoadingResultState.Success ? handleClose : undefined}
      state={state}
      subtitle={translate(`restoreBackup.processing.${state}.subtitle`)}
      successCloseButtonLabel={translate('common.close')}
      testID="RestoreBackupProcessingScreen"
      title={translate(`restoreBackup.processing.${state}.title`)}
      variation={LoadingResultVariation.Neutral}
    />
  );
};

export default ProcessingScreen;
