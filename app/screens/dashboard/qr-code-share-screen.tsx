import {
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  ContrastingStatusBar,
  ExchangeProtocol,
  QrCode,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
  useProofDelete,
  useProofState,
  useProposeProof,
} from '@procivis/one-react-native-components';
import {
  OneError,
  ProofStateEnum,
  ProposeProofResponse,
} from '@procivis/react-native-one-core';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';

import BleWarning from '../../components/ble/ble-warning';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useBlePermissions } from '../../hooks/ble-permissions';
import { useCapturePrevention } from '../../hooks/capture-prevention';
import { translate } from '../../i18n';
import { DashboardNavigationProp } from '../../navigators/dashboard/dashboard-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { useIsAppActive } from '../../utils/appState';

const QRCodeShareScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<DashboardNavigationProp<'QRCodeShare'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Dashboard'>>();
  const isFocused = useIsFocused();
  const isAppActive = useIsAppActive();
  useCapturePrevention();

  const { mutateAsync: proposeProof } = useProposeProof();
  const { mutateAsync: deleteProof } = useProofDelete();
  const { permissionStatus, checkPermissions, requestPermission } =
    useBlePermissions(ExchangeProtocol.ISO_MDL);
  const [adapterDisabled, setAdapterDisabled] = useState<boolean>(false);
  const [proof, setProof] = useState<ProposeProofResponse>();
  const { data: proofState } = useProofState(proof?.proofId, isFocused);

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
    if (adapterDisabled || proof || !isAppActive || !isFocused) {
      return;
    }

    proposeProof(ExchangeProtocol.ISO_MDL)
      .then((result) => {
        setProof(result);
      })
      .catch((e: unknown) => {
        if (
          e instanceof OneError &&
          e.cause?.includes('BLE adapter not enabled')
        ) {
          setAdapterDisabled(true);
        }
      });
  }, [adapterDisabled, proposeProof, proof, isAppActive, isFocused]);

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

  const qrCodeContent = useMemo(() => {
    const status = adapterDisabled ? 'disabled' : permissionStatus;

    if (status && status !== RESULTS.GRANTED) {
      return <BleWarning status={status} />;
    }

    return proof?.url ? (
      <QrCode content={proof.url} />
    ) : (
      <ActivityIndicator animate={isFocused} />
    );
  }, [adapterDisabled, permissionStatus, proof, isFocused]);

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

  const testID = 'QRCodeShareScreen';

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={navigation.goBack}
            testID="QRCodeShareScreen.header.close"
          />
        ),
        static: true,
        title: translate('wallet.qrCodeShareScreen.title'),
      }}
      modalPresentation
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      testID={testID}
    >
      <ContrastingStatusBar backgroundColor={colorScheme.background} />
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
