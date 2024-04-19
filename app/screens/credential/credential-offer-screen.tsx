import {
  Button,
  CredentialDetailsCard,
  EntityCluster,
  NavigationHeader,
  useAppColorScheme,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
import { detailsCardFromCredential } from '../../utils/credential';
import { reportException } from '../../utils/reporting';

const CredentialOfferScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOffer'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOffer'>>();
  const { credentialId, interactionId } = route.params;
  const { top } = useSafeAreaInsets();
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const infoPressHandler = useCallback(() => {}, []);

  useBlockOSBackNavigation();

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
    navigation.navigate('Processing', {
      credentialId,
      interactionId,
    });
  }, [credentialId, interactionId, navigation]);

  const onImagePreview = useCredentialImagePreview();

  const { card, attributes } = credential
    ? detailsCardFromCredential(credential, config)
    : { attributes: [], card: undefined };

  const safeAreaPaddingStyle: ViewStyle | undefined =
    Platform.OS === 'android'
      ? {
          paddingTop: top,
        }
      : undefined;

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, safeAreaPaddingStyle]}
      style={styles.scrollView}
      testID="CredentialOfferScreen"
    >
      <NavigationHeader
        leftItem={HeaderCloseModalButton}
        modalHandleVisible={Platform.OS === 'ios'}
        rightItem={<HeaderInfoButton onPress={infoPressHandler} />}
        title={translate('credentialOffer.title')}
      />

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
            <SafeAreaView edges={['bottom']} style={styles.bottom}>
              <Button
                onPress={onAccept}
                testID="CredentialOfferScreen.accept"
                title={translate('credentialOffer.accept')}
              />
            </SafeAreaView>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
  issuer: {
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
});

export default CredentialOfferScreen;
