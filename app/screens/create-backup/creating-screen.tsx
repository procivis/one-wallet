import {
  ButtonType,
  LoaderViewState,
  LoadingResultScreen,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCloseButtonTimeout,
  useCreateBackup,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { DocumentDirectoryPath } from 'react-native-fs';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { translate, translateError } from '../../i18n';
import { CreateBackupProcessingRouteProp } from '../../navigators/create-backup/create-backup-processing-routes';
import { CreateBackupNavigationProp } from '../../navigators/create-backup/create-backup-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { getBackupFileName } from '../../utils/backup';

const CreatingScreen: FC = () => {
  const navigation = useNavigation<CreateBackupNavigationProp<'Processing'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
  const {
    params: { password },
  } = useRoute<CreateBackupProcessingRouteProp<'Creating'>>();
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const { mutateAsync: createBackup } = useCreateBackup();
  const [error, setError] = useState<unknown>();

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
        password,
      });
      setState(LoaderViewState.Success);
    } catch (e) {
      setState(LoaderViewState.Warning);
      setError(e);
    }
  }, [createBackup, password, backupFilePath]);

  useEffect(() => {
    handleBackupCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closing = useRef(false);
  const handleClose = useCallback(() => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    switch (state) {
      case LoaderViewState.InProgress:
        navigation.goBack();
        return;
      case LoaderViewState.Warning:
        navigation.navigate('CreateBackupDashboard');
        return;
      case LoaderViewState.Success:
        navigation.navigate('CreateBackupDashboard', {
          backupFileName,
          backupFilePath,
        });
        return;
    }
  }, [backupFileName, backupFilePath, navigation, state]);

  useBeforeRemove(handleClose);

  const { closeTimeout } = useCloseButtonTimeout(
    state === LoaderViewState.Success,
    handleClose,
  );

  const infoPressHandler = useCallback(() => {
    if (!error) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: { error },
      screen: 'ErrorNerdMode',
    });
  }, [error, rootNavigation]);

  return (
    <LoadingResultScreen
      button={
        state === LoaderViewState.Success
          ? {
              onPress: handleClose,
              testID: 'CreateBackupProcessingScreen.close',
              title: translate('common.closeWithTimeout', {
                timeout: closeTimeout,
              }),
              type: ButtonType.Secondary,
            }
          : undefined
      }
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={handleClose}
            testID="CreateBackupProcessingScreen.header.close"
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        rightItem:
          state === LoaderViewState.Warning ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID="CreateBackupProcessingScreen.header.info"
            />
          ) : undefined,
        title: translate('createBackup.processing.title'),
      }}
      loader={{
        animate: true,
        label: translateError(
          error,
          translate(`createBackup.processing.${state}`),
        ),
        state,
      }}
      testID="CreateBackupProcessingScreen"
    />
  );
};

export default CreatingScreen;
