import {
  LoaderViewState,
  NFCProcess,
  reportException,
  useProofDelete,
  useProofState,
  useProposeProof,
  VerificationEngagement,
  VerificationProtocol,
} from '@procivis/one-react-native-components';
import {
  ProofStateEnum,
  ProposeProofResponse,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useBlePermissions } from '../../hooks/ble-permissions';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { useIsAppActive } from '../../utils/appState';

const QRCodeNFCScreen = () => {
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeNFC'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Dashboard'>>();
  const [proof, setProof] = useState<ProposeProofResponse>();
  const isFocused = useIsFocused();
  const isAppActive = useIsAppActive();
  const { data: proofState } = useProofState(proof?.proofId, isFocused);
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(VerificationProtocol.ISO_MDL);
  const { mutateAsync: deleteProof } = useProofDelete();
  const { mutateAsync: proposeProof } = useProposeProof();

  useEffect(() => {
    if (permissionStatus !== 'granted') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    if (isFocused) {
      checkPermissions();
    }
  }, [isFocused, checkPermissions, requestPermission]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleProposeProof = useCallback(async () => {
    try {
      const result = await proposeProof({
        engagement: [VerificationEngagement.NFC],
        exchange: VerificationProtocol.ISO_MDL,
      });
      setProof(result);
    } catch (e) {
      reportException(e, 'Failed to propose proof');
    }
  }, [proposeProof]);

  useEffect(() => {
    if (permissionStatus !== 'granted' || proof || !isAppActive || !isFocused) {
      return;
    }
    handleProposeProof();
  }, [
    proposeProof,
    proof,
    isFocused,
    handleProposeProof,
    isAppActive,
    permissionStatus,
  ]);

  const handleButtonClick = useCallback(() => {
    if (permissionStatus === 'granted') {
      handleClose();
    } else {
      checkPermissions();
    }
  }, [checkPermissions, handleClose, permissionStatus]);

  const pendingProofId = useRef<string | undefined>(undefined);
  pendingProofId.current =
    proofState === ProofStateEnum.PENDING ? proof?.proofId : undefined;

  // delete proof when app goes to background
  useEffect(() => {
    if (isAppActive === false && pendingProofId.current) {
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
    if (proof && proofState === ProofStateEnum.REQUESTED) {
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

  return (
    <NFCProcess
      handleButtonClick={handleButtonClick}
      labels={{
        close: translate('common.close'),
        conectivityInfo: translate(
          'info.requestProof.nfcProcess.connectivityWarning',
        ),
        connectivity: translate('common.connectivity'),
        share: translate('common.share'),
        shareInfo: translate('info.requestProof.nfcProcess.share'),
        tryAgain: translate('common.tryAgain'),
      }}
      processState={
        permissionStatus === 'granted'
          ? LoaderViewState.InProgress
          : LoaderViewState.Warning
      }
      testID="RequestProofNFCProcessScreen"
    />
  );
};

export default memo(QRCodeNFCScreen);
