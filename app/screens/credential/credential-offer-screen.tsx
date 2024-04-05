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
import React, { FunctionComponent, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCoreConfig } from '../../hooks/core/core-config';
import {
  useCredentialDetail,
  useCredentialReject,
} from '../../hooks/core/credentials';
import { useCredentialCardExpanded } from '../../hooks/credential-card/credential-card-expanding';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useBeforeRemove } from '../../hooks/navigation/beforeRemove';
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
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectCredential } = useCredentialReject();
  const { expanded, onHeaderPress } = useCredentialCardExpanded();

  useBlockOSBackNavigation();

  const reject = useCallback(() => {
    rejectCredential(interactionId).catch((e) =>
      reportException(e, 'Reject credential offer failed'),
    );
  }, [interactionId, rejectCredential]);

  useBeforeRemove(reject);

  const onAccept = useCallback(() => {
    navigation.navigate('Processing', {
      credentialId,
      interactionId,
    });
  }, [credentialId, interactionId, navigation]);

  const onImagePreview = useCredentialImagePreview();

  const { card, attributes } = credential
    ? detailsCardFromCredential(credential, config)
    : { attributes: [], card: undefined };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={styles.scrollView}
      testID="CredentialOfferScreen"
    >
      <NavigationHeader
        leftItem={HeaderCloseModalButton}
        modalHandleVisible
        title={translate('credentialOffer.title')}
      />

      <View style={styles.content} testID="CredentialOfferScreen.content">
        <EntityCluster
          entityName={
            credential?.issuerDid ?? translate('credentialOffer.unknownIssuer')
          }
          style={[styles.issuer, { borderBottomColor: colorScheme.grayDark }]}
        />
        {!credential || !card ? (
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
              testID="CredentialOfferScreen.detail"
            />
            <SafeAreaView edges={['bottom']} style={styles.bottom}>
              <Button
                onPress={onAccept}
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
