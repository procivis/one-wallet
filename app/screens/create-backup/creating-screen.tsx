import {
  ButtonType,
  colorWithAlphaComponent,
  LoaderViewState,
  LoadingResultScreen,
  reportException,
  useAppColorScheme,
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
import {
  InteractionManager,
  NativeModules,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { DocumentDirectoryPath, unlink } from 'react-native-fs';
import Share from 'react-native-share';

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
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<CreateBackupNavigationProp<'Processing'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
  const {
    params: { password },
  } = useRoute<CreateBackupProcessingRouteProp<'Creating'>>();
  const [state, setState] = useState<
    Exclude<LoaderViewState, LoaderViewState.Error>
  >(LoaderViewState.InProgress);
  const { mutateAsync: createBackup } = useCreateBackup();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<unknown>();

  useBlockOSBackNavigation();

  const backupFileName = useMemo(() => getBackupFileName(), []);
  const backupFilePath = useMemo(
    () => `${DocumentDirectoryPath}/${backupFileName}`,
    [backupFileName],
  );

  const handleSaveFile = useCallback(() => {
    const saveBackup = async () => {
      try {
        const url = `file://${backupFilePath}`;
        const filename = backupFileName;
        const mimeType = 'application/zip';
        let success;
        if (Platform.OS === 'ios') {
          const shareResponse = await Share.open({
            failOnCancel: false,
            filename,
            type: mimeType,
            url,
          });
          success = shareResponse.success;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await NativeModules.FileExporter.export({
            filename,
            mimeType,
            url,
          });
          success = true;
        }
        if (success) {
          await unlink(backupFilePath);
          setState(LoaderViewState.Success);
        } else {
          setState(LoaderViewState.Warning);
        }
        setIsSaving(false);
      } catch (e) {
        setIsSaving(false);
        setState(LoaderViewState.Warning);
        setError(e);
        reportException(e, 'Backup move failure');
      }
    };
    setIsSaving(true);
    InteractionManager.runAfterInteractions(() => {
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          saveBackup();
        }, 500);
      } else {
        saveBackup();
      }
    });
  }, [backupFileName, backupFilePath]);

  const handleBackupCreate = useCallback(async () => {
    try {
      await createBackup({
        outputPath: backupFilePath,
        password,
      });
      handleSaveFile();
    } catch (e) {
      setState(LoaderViewState.Warning);
      setError(e);
    }
  }, [createBackup, backupFilePath, password, handleSaveFile]);

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
        rootNavigation.navigate('Dashboard', { screen: 'Wallet' });
        return;
    }
  }, [navigation, rootNavigation, state]);

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

  const loaderBackgroundStyle = {
    backgroundColor: colorWithAlphaComponent(colorScheme.black, 0.5),
  };

  return (
    <>
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
      {isSaving && (
        <View style={[StyleSheet.absoluteFill, loaderBackgroundStyle]} />
      )}
    </>
  );
};

export default CreatingScreen;
