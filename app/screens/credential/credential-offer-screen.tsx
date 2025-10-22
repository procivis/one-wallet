import {
  ActivityIndicator,
  Button,
  concatTestID,
  CredentialAttribute,
  CredentialCardShadow,
  CredentialDetailsCard,
  detailsCardFromCredential,
  EntityDetails,
  ScrollViewScreen,
  useAppColorScheme,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCoreConfig,
  useCredentialAccept,
  useCredentialCardExpanded,
  useCredentialDetail,
  useCredentialReject,
  useCredentialSchemaDetail,
  useTrustEntity,
  useWalletUnitAttestation,
} from '@procivis/one-react-native-components';
import {
  ClaimSchema,
  IssuanceProtocolFeatureEnum,
  OneError,
  TrustEntityRoleEnum,
  Ubiqu,
  WalletStorageType,
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
import { Alert, Dimensions, Platform, StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import ShareDisclaimer from '../../components/share/share-disclaimer';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCreateRSE } from '../../hooks/rse';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { IncompatibleKeyStorageError } from '../../models/errors';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';
import { walletUnitAttestationState } from '../../utils/wallet-unit';

const {
  addEventListener: addRSEEventListener,
  PinEventType,
  PinFlowType,
} = Ubiqu;

// fallback empty attributes for credential offer without claim values
const getDummyAttributes = (
  claimSchemas: ClaimSchema[],
): CredentialAttribute[] =>
  claimSchemas.map((schema) => ({
    attributes: [],
    id: schema.id,
    name: schema.key,
    path: schema.key,
  }));

const CredentialOfferScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const { invitationResult, txCode } = route.params;
  const { interactionId, walletStorageType } = invitationResult;
  const cardWidth = useMemo(() => Dimensions.get('window').width - 32, []);

  const [acceptanceInitialized, setAcceptanceInitialized] = useState(false);
  const { mutateAsync: acceptCredential } = useCredentialAccept();
  const [rseInitialized, setRseInitialized] = useState(false);
  const [createdRseIdentifierId, setCreatedRseIdentifierId] =
    useState<string>();
  const { generateRSE } = useCreateRSE();
  const [credentialId, setCredentialId] = useState<string>();
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: credentialSchema } = useCredentialSchemaDetail(
    credential?.schema.id,
  );
  const { data: trustEntity } = useTrustEntity(credential?.issuer?.id);
  const { data: walletUnitAttestation, isLoading: isLoadingWUA } =
    useWalletUnitAttestation();
  const { walletStore } = useStores();
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  const identifierId = useMemo(() => {
    switch (walletStorageType) {
      case WalletStorageType.SOFTWARE:
        return walletStore.holderSwIdentifierId;
      case WalletStorageType.HARDWARE:
        return walletStore.holderHwIdentifierId;
      case WalletStorageType.REMOTE_SECURE_ELEMENT:
        return createdRseIdentifierId ?? walletStore.holderRseIdentifierId;
      default:
        return walletStore.holderIdentifierId;
    }
  }, [walletStore, walletStorageType, createdRseIdentifierId]);

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
  }, [navigation, rootNavigation, walletStore.holderRseIdentifierId]);

  const initializeRSE = useCallback(() => {
    if (rseInitialized) {
      return;
    }
    setRseInitialized(true);
    generateRSE()
      .then(setCreatedRseIdentifierId)
      .catch((error) => {
        navigation.replace('Result', {
          error,
        });
      });
  }, [generateRSE, navigation, rseInitialized]);

  const handleCredentialAccept = useCallback(async () => {
    if (acceptanceInitialized) {
      return;
    }
    setAcceptanceInitialized(true);
    try {
      const credentialId = await acceptCredential({
        identifierId,
        interactionId,
        txCode,
      });
      setCredentialId(credentialId);
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
    identifierId,
    interactionId,
    txCode,
    navigation,
    invitationResult,
  ]);

  useEffect(() => {
    if (walletStorageType && !identifierId) {
      if (walletStorageType === WalletStorageType.REMOTE_SECURE_ELEMENT) {
        initializeRSE();
      } else {
        navigation.replace('Result', {
          error: new IncompatibleKeyStorageError(),
        });
      }
      return;
    }
    handleCredentialAccept();
  }, [
    credential,
    identifierId,
    handleCredentialAccept,
    initializeRSE,
    walletStorageType,
    navigation,
  ]);

  const infoPressHandler = useCallback(() => {
    if (!credentialId) {
      return;
    }
    rootNavigation.navigate('NerdMode', {
      params: {
        credentialId,
      },
      screen: 'OfferNerdMode',
    });
  }, [credentialId, rootNavigation]);

  const skipRejection = useRef(false);
  const reject = useCallback(() => {
    const exchangeConfig = config?.issuanceProtocol[credential?.protocol ?? ''];
    const exchangeCapabilities = exchangeConfig?.capabilities;
    const exchangeFeatures = exchangeCapabilities?.features;
    const supportsRejection = exchangeFeatures?.includes(
      IssuanceProtocolFeatureEnum.SupportsRejection,
    );
    if (!skipRejection.current && supportsRejection) {
      rejectCredential(interactionId);
    }
  }, [
    config?.issuanceProtocol,
    credential?.protocol,
    interactionId,
    rejectCredential,
  ]);
  useBeforeRemove(reject);

  const onAccept = useCallback(() => {
    if (!credentialId) {
      return;
    }

    skipRejection.current = true;

    navigation.replace('Result', {
      redirectUri: credential?.redirectUri,
    });
  }, [credential?.redirectUri, credentialId, navigation]);

  const onImagePreview = useCredentialImagePreview();
  const testID = 'CredentialOfferScreen';

  const { card, attributes } =
    credential && config
      ? detailsCardFromCredential(
          credential,
          config,
          walletUnitAttestationState(walletUnitAttestation),
          `${testID}.detail`,
          credentialCardLabels(),
        )
      : { attributes: [], card: undefined };

  const displayedAttributes = useMemo(() => {
    if (attributes && attributes.length) {
      return attributes;
    }
    return credentialSchema ? getDummyAttributes(credentialSchema.claims) : [];
  }, [attributes, credentialSchema]);

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

  const isCheckingWUA =
    credential &&
    credential.schema.walletStorageType === WalletStorageType.EUDI_COMPLIANT &&
    isLoadingWUA;

  return (
    <ScrollViewScreen
      header={{
        leftItem: closeButton,
        rightItem: credentialId ? (
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
      {!credentialId || !credential || !config || !card || isCheckingWUA ? (
        <ActivityIndicator animate={isFocused} style={styles.loader} />
      ) : (
        <View style={styles.content} testID={concatTestID(testID, 'content')}>
          <EntityDetails
            identifier={credential?.issuer}
            labels={trustEntityDetailsLabels(TrustEntityRoleEnum.ISSUER)}
            role={TrustEntityRoleEnum.ISSUER}
            style={[styles.issuer, { borderBottomColor: colorScheme.grayDark }]}
            testID={concatTestID(testID, 'entityCluster')}
          />
          <View
            style={styles.credentialWrapper}
            testID={`HolderCredentialID.value.${credential.id}`}
          >
            <CredentialDetailsCard
              attributes={displayedAttributes}
              card={{
                ...card,
                onHeaderPress,
                width: cardWidth,
              }}
              expanded={expanded}
              onImagePreview={onImagePreview}
              showAllButtonLabel={translate('common.seeAll')}
            />
          </View>
          <View style={styles.bottom}>
            <Button
              onPress={onAccept}
              testID={concatTestID(testID, 'accept')}
              title={translate('common.accept')}
            />
          </View>
          <ShareDisclaimer
            action={translate('common.accept')}
            ppUrl={trustEntity?.privacyUrl}
            testID={concatTestID(testID, 'disclaimer')}
            tosUrl={trustEntity?.termsUrl}
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
