import {
  ActivityIndicator,
  Button,
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
} from '@procivis/one-react-native-components';
import { TrustEntityRoleEnum } from '@procivis/react-native-one-core';
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
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { reportException } from '../../utils/reporting';
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
    if (!skipRejection.current) {
      rejectCredential(interactionId).catch((e) =>
        reportException(e, 'Reject credential offer failed'),
      );
    }
  }, [interactionId, rejectCredential]);
  useBeforeRemove(reject);

  const onAccept = useCallback(() => {
    skipRejection.current = true;

    if (txCode) {
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
  }, [credentialId, interactionId, navigation, txCode]);

  const onImagePreview = useCredentialImagePreview();

  const { card, attributes } =
    credential && config
      ? detailsCardFromCredential(
          credential,
          config,
          'CredentialOfferScreen.detail',
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
    () => <HeaderCloseModalButton onPress={onCloseButtonPress} />,
    [onCloseButtonPress],
  );

  return (
    <ScrollViewScreen
      header={{
        leftItem: closeButton,
        rightItem: <HeaderInfoButton onPress={infoPressHandler} />,
        static: true,
        title: translate('credentialOffer.title'),
      }}
      modalPresentation
      scrollView={{
        testID: 'CredentialOfferScreen.scroll',
      }}
      testID="CredentialOfferScreen"
    >
      <View style={styles.content} testID="CredentialOfferScreen.content">
        <EntityDetails
          did={credential?.issuerDid}
          labels={trustEntityDetailsLabels(TrustEntityRoleEnum.ISSUER)}
          role={TrustEntityRoleEnum.ISSUER}
          style={[styles.issuer, { borderBottomColor: colorScheme.grayDark }]}
        />
        {!credential || !config || !card ? (
          <ActivityIndicator animate={isFocused} />
        ) : (
          <>
            <View style={styles.credentialWrapper}>
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
                testID="CredentialOfferScreen.accept"
                title={translate('credentialOffer.accept')}
              />
            </View>
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
