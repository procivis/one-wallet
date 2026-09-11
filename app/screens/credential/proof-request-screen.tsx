import {
  ActivityIndicator,
  ScrollViewScreen,
  TrustInfo,
  useBeforeRemove,
  useOrganisationDetail,
  useProofDetail,
  useProofReject,
  useProofRequestTrustInformation,
} from '@procivis/one-react-native-components';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import ProofPresentationV2 from '../../components/proof-request/proof-presentation-v2';
import ShareDisclaimer from '../../components/share/share-disclaimer';
import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { trustInfoLabels } from '../../utils/trust-info';

const ProofRequestScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();
  const language = useCurrentLanguage();
  const { mutateAsync: rejectProof } = useProofReject();
  const isFocused = useIsFocused();
  const {
    request: { interactionId, proofId },
  } = route.params;
  const { data: orgDetail } = useOrganisationDetail();
  const { data: proof } = useProofDetail(proofId);
  const { data: trustInformation } = useProofRequestTrustInformation(
    featureFlags?.ecosystemsEnabled ? proofId : undefined,
  );

  // If this is true, we should not attempt to reject in useBeforeRemove
  const proofAccepted = useRef<boolean>(false);

  const [presentationDefinitionLoaded, setPresentationDefinitionLoaded] =
    useState(false);

  const onPresentationDefinitionLoaded = useCallback(() => {
    setPresentationDefinitionLoaded(true);
  }, []);

  const trustDetailsPressHandler = useCallback(() => {
    if (!proof?.trustInformation || !trustInformation) {
      return;
    }
    rootNavigation.navigate('TrustInfo', {
      ecosystemErrors: trustInformation.ecosystemErrors,
      result: proof?.trustInformation.result,
      trustInformation: trustInformation.verifier,
    });
  }, [rootNavigation, proof, trustInformation]);

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: {
        proofId,
      },
      screen: 'ProofNerdMode',
    });
  }, [proofId, rootNavigation]);

  const reject = useCallback(() => {
    if (!isFocused || proofAccepted.current) {
      return;
    }
    rejectProof(interactionId);
  }, [interactionId, isFocused, rejectProof]);

  useBeforeRemove(reject);

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderCloseModalButton testID="ProofRequestSharingScreen.header.close" />
        ),
        rightItem: (
          <HeaderInfoButton
            onPress={infoPressHandler}
            testID="ProofRequestSharingScreen.header.info"
          />
        ),
        static: true,
        title: translate('common.shareCredential'),
      }}
      modalPresentation
      scrollView={{
        testID: 'ProofRequestSharingScreen.scroll',
      }}
      testID="ProofRequestSharingScreen"
    >
      <View style={styles.content} testID="ProofRequestSharingScreen.content">
        {featureFlags?.ecosystemsEnabled && (
          <TrustInfo
            labels={trustInfoLabels()}
            language={language}
            onPress={trustDetailsPressHandler}
            style={styles.verifier}
            testID="ProofRequestSharingScreen.trustInfo"
            translate={
              orgDetail?.configuration?.enforceEcosystemAsHolder === false
            }
            trustInformation={
              proof?.trustInformation && trustInformation
                ? {
                    identifier: trustInformation.verifier?.value[0]?.identifier,
                    name:
                      proof.trustInformation.name ??
                      trustInformation.verifier?.value[0]?.name,
                    result: proof.trustInformation.result,
                  }
                : undefined
            }
          />
        )}
        <>
          <ProofPresentationV2
            onPresentationDefinitionLoaded={onPresentationDefinitionLoaded}
            proofAccepted={proofAccepted}
          />
          {!presentationDefinitionLoaded ? (
            <ActivityIndicator
              animate={isFocused}
              testID="ProofRequestSharingScreen.indicator.credentials"
            />
          ) : (
            <ShareDisclaimer
              action={translate('common.share')}
              // TODO: propagate proper URLs
              ppUrl={undefined}
              testID="ProofRequestSharingScreen.disclaimer"
              tosUrl={undefined}
            />
          )}
        </>
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  verifier: {
    paddingHorizontal: 0,
    paddingTop: 16,
  },
});

export default ProofRequestScreen;
