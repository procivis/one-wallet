import {
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  CredentialCardShadow,
  CredentialOfferDetails,
  reportException,
  ScrollViewScreen,
  TrustInfo,
  useAppColorScheme,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCoreConfig,
  useCredentialAccept,
  useCredentialDetail,
  useCredentialReject,
  useCredentialRejectFormat,
  useCredentialsOffer,
  useCredentialTrustInformation,
  useOrganisationDetail,
} from '@procivis/one-react-native-components';
import {
  HolderAcceptCredentialResponse,
  IssuanceProtocolFeature,
  OneError,
  Ubiqu,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import ShareDisclaimer from '../../components/share/share-disclaimer';
import { useCredentialOfferSelectedCards } from '../../hooks/credential-card/credential-card-expanding';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialOfferCardLabels } from '../../utils/credential';
import { trustInfoLabels } from '../../utils/trust-info';

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinFlowType,
} = Ubiqu;

const CredentialOfferScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();
  const { invitationResult, txCode } = route.params;
  const { interactionId } = invitationResult;

  const [acceptanceInitialized, setAcceptanceInitialized] = useState(false);
  const { mutateAsync: acceptCredential } = useCredentialAccept();
  const acceptance = useRef<
    Promise<HolderAcceptCredentialResponse> | undefined
  >(undefined);
  const [acceptedIds, setAcceptedIds] = useState<string[]>();
  const [credentialIds, setCredentialIds] = useState<string[]>();
  const { data: orgDetail } = useOrganisationDetail();
  const { data: credentialsOffer } = useCredentialsOffer(
    interactionId,
    acceptedIds,
  );
  const { data: credential } = useCredentialDetail(credentialIds?.[0]);
  const { data: trustInformation } = useCredentialTrustInformation(
    featureFlags?.ecosystemsEnabled ? credentialIds?.[0] : undefined,
  );
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();
  const { mutateAsync: rejectCredentialFormat } = useCredentialRejectFormat();
  const { onHeaderPress, selectedCredentials, setInitialSelection } =
    useCredentialOfferSelectedCards();
  const language = useCurrentLanguage();

  useEffect(() => {
    return addRSEEventListener((event) => {
      if (event.type !== PinEventType.SHOW_PIN) {
        return;
      }
      if (event.flowType === PinFlowType.TRANSACTION) {
        rootNavigation.navigate('RSESign');
      } else if (event.flowType === PinFlowType.SUBSCRIBE) {
        navigation.navigate('RSEPinSetup');
      } else if (event.flowType === PinFlowType.ADD_BIOMETRICS) {
        navigation.navigate('RSEAddBiometrics');
      }
    });
  }, [navigation, rootNavigation]);

  const handleCredentialAccept = useCallback(async () => {
    if (acceptanceInitialized) {
      return;
    }
    setAcceptanceInitialized(true);
    try {
      acceptance.current = acceptCredential({
        interactionId,
        txCode,
      });
      const result = await acceptance.current;
      setAcceptedIds(result.credentialIds);
    } catch (error) {
      const invalidCodeBRs = ['BR_0169', 'BR_0170'];
      if (error instanceof OneError && invalidCodeBRs.includes(error.code)) {
        return navigation.replace('CredentialConfirmationCode', {
          invalidCode: txCode,
          invitationResult,
        });
      }
      navigation.replace('Result', {
        error,
      });
    }
  }, [
    acceptanceInitialized,
    acceptCredential,
    interactionId,
    txCode,
    navigation,
    invitationResult,
  ]);

  useEffect(() => {
    handleCredentialAccept();
  }, [credential, handleCredentialAccept, navigation]);

  useEffect(() => {
    if (credentialIds !== undefined || !credentialsOffer) {
      return;
    }
    const batchIds = Object.values(credentialsOffer.batches).flatMap(
      (credentials) => Object.keys(credentials),
    );
    const allIds = batchIds.concat(credentialsOffer.singles);
    setCredentialIds(allIds);
    setInitialSelection(allIds);
  }, [credentialIds, credentialsOffer, setInitialSelection]);

  const trustDetailsPressHandler = useCallback(() => {
    if (!credential?.trustInformation || !trustInformation) {
      return;
    }
    rootNavigation.navigate('TrustInfo', {
      result: credential?.trustInformation.result,
      trustInformation: trustInformation.issuer,
    });
  }, [rootNavigation, credential, trustInformation]);

  const infoPressHandler = useCallback(() => {
    if (!credentialIds) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: {
        credentialIds,
      },
      screen: 'OfferNerdMode',
    });
  }, [credentialIds, rootNavigation]);

  const skipRejection = useRef(false);
  const reject = useCallback(() => {
    const exchangeConfig = config?.issuanceProtocol[invitationResult.protocol];
    const exchangeCapabilities = exchangeConfig?.capabilities;
    const exchangeFeatures = exchangeCapabilities?.features;
    // a not yet loaded config is not treated as unsupported
    const rejectionUnsupported =
      exchangeFeatures !== undefined &&
      !exchangeFeatures.includes(IssuanceProtocolFeature.SupportsRejection);
    if (skipRejection.current || rejectionUnsupported) {
      return;
    }

    const rejectAfterAcceptance = async () => {
      try {
        // a rejection sent before the acceptance completes finds no credential
        await acceptance.current;
      } catch {
        // the acceptance failed, there is nothing to reject
        return;
      }
      try {
        await rejectCredential({ interactionId });
      } catch (error) {
        // BR_0237: rejection not supported by the protocol
        if (error instanceof OneError && error.code === 'BR_0237') {
          return;
        }
        reportException(error, 'Failed to reject credential offer');
      }
    };
    void rejectAfterAcceptance();
  }, [
    config?.issuanceProtocol,
    invitationResult.protocol,
    interactionId,
    rejectCredential,
  ]);
  useBeforeRemove(reject);

  const onAccept = useCallback(async () => {
    if (
      !credentialsOffer ||
      !credentialIds ||
      selectedCredentials.length === 0
    ) {
      return;
    }

    skipRejection.current = true;

    const showResultScreen = () => {
      navigation.replace('Result', {
        redirectUri: credential?.redirectUri,
      });
    };

    if (selectedCredentials.length === credentialIds.length) {
      showResultScreen();
    } else {
      try {
        const credentialsToReject = credentialsOffer.singles.filter(
          (id) => !selectedCredentials.includes(id),
        );
        if (credentialsToReject.length) {
          await rejectCredential({
            credentialIds: credentialsToReject,
            interactionId,
          });
        }
        await Promise.all(
          Object.entries(credentialsOffer.batches).map(
            async ([parentId, children]) => {
              const formatsToReject = Object.entries(children)
                .filter(([id]) => !selectedCredentials.includes(id))
                .map(([_, format]) => format);
              if (formatsToReject.length === 0) {
                return Promise.resolve();
              }
              await rejectCredentialFormat({
                formats: formatsToReject,
                interactionId,
                parentId,
              });
            },
          ),
        );
        showResultScreen();
      } catch (error) {
        // BR_0237: rejection not supported by the protocol
        if (error instanceof OneError && error.code === 'BR_0237') {
          return;
        }
        reportException(error, 'Failed to reject credential offer');
      }
    }
  }, [
    credential?.redirectUri,
    credentialIds,
    credentialsOffer,
    interactionId,
    navigation,
    rejectCredential,
    rejectCredentialFormat,
    selectedCredentials,
  ]);

  const onImagePreview = useCredentialImagePreview();
  const testID = 'CredentialOfferScreen';

  const onCloseButtonPress = useCallback(() => {
    Alert.alert(
      translate('common.rejectOffering'),
      translate('info.credentialOffer.closeAlert.message'),
      [
        { text: translate('common.cancel') },
        {
          onPress: () =>
            rootNavigation.popTo('Dashboard', {
              screen: 'Wallet',
            }),
          style: 'destructive',
          text: translate('common.reject'),
        },
      ],
    );
  }, [rootNavigation]);

  const androidBackHandler = useCallback(() => {
    onCloseButtonPress();
    return true;
  }, [onCloseButtonPress]);

  useBlockOSBackNavigation(Platform.OS === 'android', androidBackHandler);

  const closeButton = useMemo(
    () => (
      <HeaderCloseModalButton
        onPress={onCloseButtonPress}
        testID={concatTestID(testID, 'header.close')}
      />
    ),
    [onCloseButtonPress],
  );

  return (
    <ScrollViewScreen
      header={{
        leftItem: closeButton,
        rightItem: credentialIds ? (
          <HeaderInfoButton
            onPress={infoPressHandler}
            testID={concatTestID(testID, 'header.info')}
          />
        ) : undefined,
        static: true,
        title: translate('common.credentialOffering'),
      }}
      modalPresentation
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      testID={testID}
    >
      {!credentialIds || !credential || !config ? (
        <ActivityIndicator animate={isFocused} style={styles.loader} />
      ) : (
        <View style={styles.content} testID={concatTestID(testID, 'content')}>
          {featureFlags?.ecosystemsEnabled && (
            <TrustInfo
              labels={trustInfoLabels()}
              language={language}
              onPress={trustDetailsPressHandler}
              style={[
                styles.issuer,
                { borderBottomColor: colorScheme.grayDark },
              ]}
              testID={concatTestID(testID, 'trustInfo')}
              translate={
                orgDetail?.configuration?.enforceEcosystemAsHolder === false
              }
              trustInformation={
                credential?.trustInformation && trustInformation
                  ? {
                      identifier:
                        trustInformation.verifier?.value[0]?.identifier,
                      name:
                        credential.trustInformation.name ??
                        trustInformation.verifier?.value[0]?.name,
                      result: credential.trustInformation.result,
                    }
                  : undefined
              }
            />
          )}
          <View
            style={styles.credentialWrapper}
            testID={`HolderCredentialID.value.${credential.id}`}
          >
            {credentialIds.map((id, index, { length }) => (
              <CredentialOfferDetails
                credentialId={id}
                hideHeaderAccessory={credentialIds.length === 1}
                key={id}
                labels={credentialOfferCardLabels()}
                language={language}
                lastItem={index === length - 1}
                onHeaderPress={onHeaderPress}
                onImagePreview={onImagePreview}
                selected={selectedCredentials.includes(id)}
              />
            ))}
          </View>
          <View style={styles.bottom}>
            <Button
              disabled={selectedCredentials.length === 0}
              onPress={onAccept}
              testID={concatTestID(testID, 'accept')}
              title={translate('common.accept')}
              type={
                selectedCredentials.length === 0
                  ? ButtonType.Secondary
                  : ButtonType.Primary
              }
            />
          </View>
          <ShareDisclaimer
            action={translate('common.accept')}
            // TODO: propagate proper URLs
            ppUrl={undefined}
            testID={concatTestID(testID, 'disclaimer')}
            tosUrl={undefined}
          />
        </View>
      )}
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 64,
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  credentialWrapper: {
    ...CredentialCardShadow,
  },
  issuer: {
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default CredentialOfferScreen;
