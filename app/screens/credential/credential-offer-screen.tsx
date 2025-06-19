import {
  ActivityIndicator,
  Button,
  concatTestID,
  CredentialCardShadow,
  CredentialDetailsCard,
  detailsCardFromCredential,
  EntityDetails,
  ScrollViewScreen,
  useAppColorScheme,
  useBeforeRemove,
  useBlockOSBackNavigation,
  useCoreConfig,
  useCredentialCardExpanded,
  useCredentialDetail,
  useCredentialReject,
  useTrustEntity,
} from '@procivis/one-react-native-components';
import {
  IssuanceProtocolFeatureEnum,
  TrustEntityRoleEnum,
  WalletStorageType,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import ShareDisclaimer from '../../components/share/share-disclaimer';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';

const CredentialOfferScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const { credentialId, interactionId, txCode } = route.params;

  const { data: credential } = useCredentialDetail(credentialId);
  const { data: trustEntity } = useTrustEntity(credential?.issuer?.id);
  const { walletStore } = useStores();
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: {
        credentialId,
      },
      screen: 'OfferNerdMode',
    });
  }, [credentialId, rootNavigation]);

  const skipRejection = useRef(false);
  const reject = useCallback(() => {
    const exchangeConfig = config?.issuanceProtocol[credential?.exchange ?? ''];
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
    credential?.exchange,
    interactionId,
    rejectCredential,
  ]);
  useBeforeRemove(reject);

  const onAccept = useCallback(() => {
    skipRejection.current = true;

    const requiredStorageType = credential?.schema.walletStorageType;

    if (
      requiredStorageType === WalletStorageType.REMOTE_SECURE_ELEMENT &&
      !walletStore.holderDidRseId
    ) {
      navigation.navigate('RSEInfo', {
        credentialId,
        interactionId,
      });
    } else if (txCode) {
      navigation.replace('CredentialConfirmationCode', {
        credentialId,
        interactionId,
        txCode,
      });
    } else {
      navigation.replace('Processing', {
        credentialId,
        interactionId,
      });
    }
  }, [
    credential?.schema.walletStorageType,
    credentialId,
    interactionId,
    navigation,
    txCode,
    walletStore.holderDidRseId,
  ]);

  const onImagePreview = useCredentialImagePreview();
  const testID = 'CredentialOfferScreen';

  const { card, attributes } =
    credential && config
      ? detailsCardFromCredential(
          credential,
          config,
          `${testID}.detail`,
          credentialCardLabels(),
        )
      : { attributes: [], card: undefined };

  const onCloseButtonPress = useCallback(() => {
    Alert.alert(
      translate('credentialOffer.closeAlert.title'),
      translate('credentialOffer.closeAlert.message'),
      [
        { text: translate('common.cancel') },
        {
          onPress: () =>
            rootNavigation.navigate('Dashboard', {
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
        rightItem: (
          <HeaderInfoButton
            onPress={infoPressHandler}
            testID={concatTestID(testID, 'header.info')}
          />
        ),
        static: true,
        title: translate('credentialOffer.title'),
      }}
      modalPresentation
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      testID={testID}
    >
      <View style={styles.content} testID={concatTestID(testID, 'content')}>
        <EntityDetails
          identifier={credential?.issuer}
          labels={trustEntityDetailsLabels(TrustEntityRoleEnum.ISSUER)}
          role={TrustEntityRoleEnum.ISSUER}
          style={[styles.issuer, { borderBottomColor: colorScheme.grayDark }]}
          testID={concatTestID(testID, 'entityCluster')}
        />
        {!credential || !config || !card ? (
          <ActivityIndicator animate={isFocused} />
        ) : (
          <>
            <View
              style={styles.credentialWrapper}
              testID={`HolderCredentialID.value.${credential.id}`}
            >
              <CredentialDetailsCard
                attributes={attributes}
                card={{
                  ...card,
                  onHeaderPress,
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
                title={translate('credentialOffer.accept')}
              />
            </View>
            <ShareDisclaimer
              action={translate('common.accept')}
              ppUrl={trustEntity?.privacyUrl}
              testID={concatTestID(testID, 'disclaimer')}
              tosUrl={trustEntity?.termsUrl}
            />
          </>
        )}
      </View>
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
});

export default CredentialOfferScreen;
