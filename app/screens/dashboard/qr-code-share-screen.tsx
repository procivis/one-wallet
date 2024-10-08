import {
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  QrCode,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { OneError, ProofStateEnum } from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';

import BleWarning from '../../components/ble/ble-warning';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useBlePermissions } from '../../hooks/ble-permissions';
import { useProofState, useProposeProof } from '../../hooks/core/proofs';
import { translate } from '../../i18n';
import { ProcivisExchangeProtocol } from '../../models/proofs';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { reportException } from '../../utils/reporting';

const QRCodeShareScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeShare'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Dashboard'>>();
  const isFocused = useIsFocused();
  const { mutateAsync: proposeProof } = useProposeProof();
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(ProcivisExchangeProtocol.ISO_MDL);
  const [adapterDisabled, setAdapterDisabled] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>();
  const [proofId, setProofId] = useState<string>();
  const [interactionId, setInteractionId] = useState<string>();
  const { data: proofState } = useProofState(proofId, true);

  useEffect(() => {
    if (permissionStatus !== 'granted') {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    if (isFocused) {
      checkPermissions();
      setAdapterDisabled(false);
    }
  }, [isFocused, checkPermissions, requestPermission]);

  useEffect(() => {
    if (adapterDisabled) {
      return;
    }
    proposeProof(ProcivisExchangeProtocol.ISO_MDL)
      .then((result) => {
        setProofId(result.proofId);
        setInteractionId(result.interactionId);
        setShareUrl(result.url);
      })
      .catch((e: OneError) => {
        if (e.message.includes('adapter is disabled')) {
          setAdapterDisabled(true);
        } else {
          reportException(e, 'Proof proposal failure');
        }
      });
  }, [adapterDisabled, proposeProof]);

  const qrCodeContent = useMemo(() => {
    const status = adapterDisabled ? 'disabled' : permissionStatus;

    if (status && status !== RESULTS.GRANTED) {
      return <BleWarning status={status} />;
    }

    return shareUrl ? (
      <QrCode content={shareUrl} />
    ) : (
      <ActivityIndicator animate={isFocused} />
    );
  }, [adapterDisabled, permissionStatus, shareUrl, isFocused]);

  useEffect(() => {
    if (!proofId || !interactionId || !proofState) {
      return;
    }
    if (proofState === ProofStateEnum.REQUESTED) {
      rootNavigation.navigate('CredentialManagement', {
        params: {
          params: { request: { interactionId, proofId } },
          screen: 'ProofRequest',
        },
        screen: 'ShareCredential',
      });
    }
  }, [interactionId, proofId, proofState, rootNavigation]);

  const testID = 'QRCodeShareScreen';

  return (
    <ScrollViewScreen
      header={{
        leftItem: <HeaderCloseModalButton onPress={navigation.goBack} />,
        static: true,
        title: translate('wallet.qrCodeShareScreen.title'),
      }}
      modalPresentation
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      testID={testID}
    >
      <View style={styles.content} testID="QRCodeShareScreen.content">
        <Typography
          align="center"
          color={colorScheme.text}
          style={styles.description}
        >
          {translate('wallet.qrCodeShareScreen.description')}
        </Typography>
        <View
          style={[styles.qrCode, { backgroundColor: colorScheme.white }]}
          testID={concatTestID(testID, 'qrCode')}
        >
          {qrCodeContent}
        </View>
      </View>
      <View style={styles.bottom}>
        <Button
          onPress={navigation.goBack}
          testID={concatTestID(testID, 'close')}
          title={translate('common.close')}
          type={ButtonType.Secondary}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 64,
    paddingHorizontal: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  description: {
    paddingBottom: 20,
    paddingTop: 12,
  },
  qrCode: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 6,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
});

export default QRCodeShareScreen;
