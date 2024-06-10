import {
  Button,
  CredentialCardShadow,
  CredentialDetailsCard,
  EntityCluster,
  ScrollViewScreen,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { useCoreConfig } from '../../hooks/core/core-config';
import {
  useCredentialDetail,
  useCredentialReject,
} from '../../hooks/core/credentials';
import { useCredentialCardExpanded } from '../../hooks/credential-card/credential-card-expanding';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useBeforeRemove } from '../../hooks/navigation/before-remove';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { detailsCardFromCredential } from '../../utils/credential';
import { reportException } from '../../utils/reporting';

const CredentialOfferScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const { credentialId, interactionId } = route.params;
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
    navigation.replace('Processing', {
      credentialId,
      interactionId,
    });
  }, [credentialId, interactionId, navigation]);

  const onImagePreview = useCredentialImagePreview();

  const { card, attributes } = credential
    ? detailsCardFromCredential(credential, config)
    : { attributes: [], card: undefined };

  return (
    <ScrollViewScreen
      header={{
        leftItem: HeaderCloseModalButton,
        modalHandleVisible: Platform.OS === 'ios',
        rightItem: <HeaderInfoButton onPress={infoPressHandler} />,
        static: true,
        title: translate('credentialOffer.title'),
      }}
      modalPresentation
      scrollView={{
        testID: 'CredentialOfferScreen',
      }}
    >
      <View style={styles.content} testID="CredentialOfferScreen.content">
        <EntityCluster
          entityName={
            credential?.issuerDid ?? translate('credentialOffer.unknownIssuer')
          }
          style={[styles.issuer, { borderBottomColor: colorScheme.grayDark }]}
        />
        {!credential || !config || !card ? (
          <ActivityIndicator />
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
                testID="CredentialOfferScreen.detail"
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
