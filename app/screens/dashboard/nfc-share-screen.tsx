import {
  ButtonType,
  concatTestID,
  LoaderViewState,
  LoadingResultScreen,
  NFCProcess,
  useNFCStatus,
  useProofDelete,
  useProofState,
  useProposeProof,
  VerificationEngagement,
  VerificationProtocol,
} from '@procivis/one-react-native-components';
import {
  OneError,
  ProofStateEnum,
  ProposeProofResponse,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { useBlePermissions } from '../../hooks/ble-permissions';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { useIsAppActive } from '../../utils/appState';

const NFCShareScreen = () => {
  const navigation = useNavigation<DashboardNavigationProp<'NFCShare'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Dashboard'>>();
  const [proof, setProof] = useState<ProposeProofResponse>();
  const isFocused = useIsFocused();
  const isAppActive = useIsAppActive();
  const { data: proofState } = useProofState(proof?.proofId, isFocused);
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(VerificationProtocol.ISO_MDL);
  const [bleDisabled, setBleDisabled] = useState<boolean>(false);
  const [error, setError] = useState<unknown>();
  const { mutateAsync: deleteProof } = useProofDelete();
  const { mutateAsync: proposeProof } = useProposeProof();
  const { isNFCEnabled, recheck: recheckNFCSupport } = useNFCStatus();

  useEffect(() => {
    if (permissionStatus !== 'granted') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    if (isFocused) {
      checkPermissions();
      setBleDisabled(false);
    }
  }, [isFocused, checkPermissions, requestPermission]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleProposeProof = useCallback(async () => {
    setError(undefined);
    try {
      const result = await proposeProof({
        engagement: [VerificationEngagement.NFC],
        protocol: VerificationProtocol.ISO_MDL,
        uiMessage: translate('info.requestProof.nfcProcess.share'),
      });
      setProof(result);
    } catch (e) {
      if (
        e instanceof OneError &&
        e.cause?.includes('BLE adapter not enabled')
      ) {
        setBleDisabled(true);
        return;
      }

      setError(e);
    }
  }, [proposeProof]);

  useEffect(() => {
    if (
      permissionStatus !== 'granted' ||
      proof ||
      !isAppActive ||
      !isFocused ||
      bleDisabled
    ) {
      return;
    }
    handleProposeProof();
  }, [
    proof,
    isFocused,
    handleProposeProof,
    isAppActive,
    permissionStatus,
    bleDisabled,
  ]);

  const handleButtonClick = useCallback(() => {
    if (permissionStatus === 'granted' && isNFCEnabled) {
      handleClose();
    } else {
      checkPermissions();
      recheckNFCSupport();
    }
  }, [
    checkPermissions,
    handleClose,
    isNFCEnabled,
    permissionStatus,
    recheckNFCSupport,
  ]);

  const pendingProofId = useRef<string | undefined>(undefined);
  pendingProofId.current =
    proofState?.state === ProofStateEnum.PENDING ? proof?.proofId : undefined;

  // delete proof when app goes to background
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      isAppActive === false &&
      pendingProofId.current
    ) {
      setProof(undefined);
      deleteProof(pendingProofId.current);
    }
  }, [isAppActive, deleteProof]);

  // delete proof when closing the screen
  useEffect(
    () => () => {
      if (pendingProofId.current) {
        deleteProof(pendingProofId.current);
      }
    },
    [deleteProof],
  );

  useEffect(() => {
    if (proof && proofState?.state === ProofStateEnum.REQUESTED) {
      rootNavigation.navigate('CredentialManagement', {
        params: {
          params: {
            request: {
              interactionId: proof.interactionId,
              proofId: proof.proofId,
            },
          },
          screen: 'ProofRequest',
        },
        screen: 'ShareCredential',
      });
    }
  }, [proof, proofState, rootNavigation]);

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: { error: error ?? proofState?.metadata },
      screen: 'ErrorNerdMode',
    });
  }, [error, proofState, rootNavigation]);

  const testID = 'RequestProofNFCProcessScreen';

  const isError = error || proofState?.state === ProofStateEnum.ERROR;
  const isWarning =
    permissionStatus !== 'granted' || !isNFCEnabled || bleDisabled;

  if (isError || (Platform.OS === 'ios' && !isWarning)) {
    return (
      <LoadingResultScreen
        button={{
          onPress: handleClose,
          title: translate('common.close'),
          type: ButtonType.Secondary,
        }}
        header={{
          leftItem: (
            <HeaderCloseModalButton
              onPress={handleClose}
              testID={concatTestID(testID, 'header.close')}
            />
          ),
          rightItem: isError ? (
            <HeaderInfoButton
              onPress={infoPressHandler}
              testID={concatTestID(testID, 'header.info')}
            />
          ) : undefined,
        }}
        loader={{
          animate: isFocused,
          label: isError
            ? translate('info.errorScreen.title')
            : translate('invitationProcessTitle.inProgress'),
          state: isError ? LoaderViewState.Error : LoaderViewState.InProgress,
          testID: concatTestID(testID, 'animation'),
        }}
        testID={testID}
      />
    );
  }

  return (
    <NFCProcess
      handleButtonClick={handleButtonClick}
      labels={{
        close: translate('common.close'),
        conectivityInfo: bleDisabled
          ? translate('info.ble.adapterDisabled')
          : translate('info.requestProof.nfcProcess.connectivityWarning'),
        connectivity: translate('common.connectivity'),
        share: translate('common.share'),
        shareInfo: translate('info.requestProof.nfcProcess.share'),
        tryAgain: translate('common.tryAgain'),
      }}
      processState={
        isWarning ? LoaderViewState.Warning : LoaderViewState.InProgress
      }
      testID={testID}
    />
  );
};

export default memo(NFCShareScreen);
