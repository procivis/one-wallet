import {
  ActivityIndicator,
  EntityDetails,
  ScrollViewScreen,
  useBeforeRemove,
  useCoreConfig,
  useProofDetail,
  useProofReject,
  useTrustEntity,
} from '@procivis/one-react-native-components';
import { TrustEntityRoleEnum } from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  ComponentType,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import {
  HeaderCloseModalButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import { ProofPresentationProps } from '../../components/proof-request/proof-presentation-props';
import ProofPresentationV1 from '../../components/proof-request/proof-presentation-v1';
import ProofPresentationV2 from '../../components/proof-request/proof-presentation-v2';
import ShareDisclaimer from '../../components/share/share-disclaimer';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';

const ProofRequestScreen: FunctionComponent = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<ShareCredentialRouteProp<'ProofRequest'>>();
  const { data: config } = useCoreConfig();
  const { mutateAsync: rejectProof } = useProofReject();
  const isFocused = useIsFocused();
  const {
    request: { interactionId, proofId },
  } = route.params;
  const { data: proof } = useProofDetail(proofId);
  const { data: trustEntity } = useTrustEntity(proof?.verifier?.id);

  // If this is true, we should not attempt to reject in useBeforeRemove
  const proofAccepted = useRef<boolean>(false);

  const [presentationDefinitionVersion, setPresentationDefinitionVersion] =
    useState<'V1' | 'V2'>();
  const [presentationDefinitionLoaded, setPresentationDefinitionLoaded] =
    useState(false);

  useEffect(() => {
    if (!config || !proof) {
      return;
    }
    const verificationProtocol = config.verificationProtocol[proof.protocol];
    const protocolCapabilities = verificationProtocol?.capabilities;
    const supportedPresentationDefinition = (protocolCapabilities as any)[
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      'supportedPresentationDefinition'
    ] as unknown as string[];
    if (supportedPresentationDefinition?.includes('V2')) {
      setPresentationDefinitionVersion('V2');
    } else {
      setPresentationDefinitionVersion('V1');
    }
  }, [config, proof]);

  const onPresentationDefinitionLoaded = useCallback(() => {
    setPresentationDefinitionLoaded(true);
  }, []);

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

  const ProofPresentation: ComponentType<ProofPresentationProps> | undefined =
    useMemo(() => {
      if (presentationDefinitionVersion === 'V1') {
        return ProofPresentationV1;
      } else if (presentationDefinitionVersion === 'V2') {
        return ProofPresentationV2;
      }
    }, [presentationDefinitionVersion]);

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
        <EntityDetails
          identifier={proof?.verifier}
          labels={trustEntityDetailsLabels(TrustEntityRoleEnum.VERIFIER)}
          role={TrustEntityRoleEnum.VERIFIER}
          style={styles.verifier}
          testID="ProofRequestSharingScreen.entityCluster"
        />
        <>
          {ProofPresentation && (
            <ProofPresentation
              onPresentationDefinitionLoaded={onPresentationDefinitionLoaded}
              proofAccepted={proofAccepted}
            />
          )}
          {!presentationDefinitionLoaded ? (
            <ActivityIndicator
              animate={isFocused}
              testID="ProofRequestSharingScreen.indicator.credentials"
            />
          ) : (
            <ShareDisclaimer
              action={translate('common.share')}
              ppUrl={trustEntity?.privacyUrl}
              testID="ProofRequestSharingScreen.disclaimer"
              tosUrl={trustEntity?.termsUrl}
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
