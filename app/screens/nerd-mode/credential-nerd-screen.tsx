import {
  ActivityIndicator,
  addElementIf,
  ColorScheme,
  CredentialSuspendedIcon,
  CredentialSuspendedTempIcon,
  CredentialValidIcon,
  formatDateTimeLocalized,
  getCredentialSchemaWithoutImages,
  NerdModeItemProps,
  NerdModeScreen,
  Typography,
  useAppColorScheme,
  useCredentialDetail,
  useCredentialTrustInformation,
  useOrganisationDetail,
} from '@procivis/one-react-native-components';
import {
  CredentialDetail,
  CredentialState,
  TrustInformationDetailInfo,
  TrustResolutionResult,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent, ReactElement, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { trustInfoLabels } from '../../utils/trust-info';
import { attributesLabels } from './utils';

const getCredentialValidityValue = (
  credential: CredentialDetail,
  colorScheme: ColorScheme,
): { icon: ReactElement; text: string; textColor: string } | undefined => {
  if (credential.state === CredentialState.SUSPENDED) {
    if (credential.suspendEndDate) {
      return {
        icon: CredentialSuspendedTempIcon,
        text: translate('info.credentialDetail.validity.suspendedUntil', {
          date: credential.suspendEndDate,
        }),
        textColor: colorScheme.warning,
      };
    } else {
      return {
        icon: CredentialSuspendedIcon,
        text: translate('common.suspended'),
        textColor: colorScheme.warning,
      };
    }
  }

  if (credential.state === CredentialState.EXPIRED) {
    if (credential.expiresAt) {
      return {
        icon: CredentialSuspendedIcon,
        text: translate('info.credentialDetail.validity.expiredAt', {
          date: credential.expiresAt,
        }),
        textColor: colorScheme.error,
      };
    } else {
      return {
        icon: CredentialSuspendedIcon,
        text: translate('common.expired'),
        textColor: colorScheme.error,
      };
    }
  }

  if (credential.state === CredentialState.REVOKED) {
    return {
      icon: CredentialSuspendedIcon,
      text: translate('common.revoked'),
      textColor: colorScheme.error,
    };
  }

  if (credential.state === CredentialState.ACCEPTED) {
    return {
      icon: CredentialValidIcon,
      text: translate('common.valid'),
      textColor: colorScheme.success,
    };
  }
};

const CredentialDetailNerdScreen: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation();
  const colorScheme = useAppColorScheme();
  const route = useRoute<NerdModeRouteProp<'CredentialNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();
  const language = useCurrentLanguage();
  const {
    walletStore: {
      walletProvider: { featureFlags },
    },
  } = useStores();
  const { data: orgDetail } = useOrganisationDetail();

  const { credentialId } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialId);
  const { data: trustInformation } = useCredentialTrustInformation(
    featureFlags?.ecosystemsEnabled &&
      credentialDetail?.trustInformation?.result ===
        TrustResolutionResult.TRUSTED
      ? credentialId
      : undefined,
  );

  const trustDetailsPressHandler = useCallback(
    (trustInformation: TrustInformationDetailInfo) => {
      if (!trustInformation) {
        return;
      }
      nav.navigate('TrustInfo', {
        result:
          credentialDetail?.trustInformation?.result ??
          TrustResolutionResult.UNKNOWN,
        trustInformation,
      });
    },
    [nav, credentialDetail],
  );

  if (!credentialDetail) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const validityData = getCredentialValidityValue(
    credentialDetail,
    colorScheme,
  );

  const credentialSchemaWithoutImages = getCredentialSchemaWithoutImages(
    credentialDetail.schema,
  );

  const nerdModeFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.credentialSchema'),
      highlightedText: credentialDetail.schema.name,
      testID: 'schemaName',
    },
    ...addElementIf(!!validityData, {
      attributeKey: translate('common.validity'),
      element: (
        <View style={styles.validityEntryContainer}>
          {validityData?.icon}
          <Typography
            color={validityData?.textColor ?? ''}
            preset="s/code"
            style={styles.validityEntryText}
            testID="CredentialNerdView.validity.attributeValue"
          >
            {validityData?.text}
          </Typography>
        </View>
      ),
      testID: 'validity',
    }),
    {
      attributeKey: translate('common.dateAdded'),
      attributeText: formatDateTimeLocalized(
        new Date(credentialDetail?.createdDate),
      ),
      testID: 'dateAdded',
    },
    ...addElementIf(Boolean(credentialDetail.schema.formats[0].format), {
      attributeKey: translate('common.credentialFormat'),
      attributeText: credentialDetail.schema.formats[0].format,
      testID: 'credentialFormat',
    }),
    ...addElementIf(
      Boolean(credentialDetail.schema.formats[0].ecosystemSchemaId),
      {
        attributeKey: translate('common.documentType'),
        attributeText: credentialDetail.schema.formats[0].ecosystemSchemaId,
        testID: 'documentType',
      },
    ),
    {
      attributeKey: translate('common.allowsRevocation'),
      attributeText: credentialDetail.schema.allowRevocation
        ? translate('common.yes')
        : translate('common.no'),
      testID: 'revocationMethod',
    },
    ...addElementIf(
      Boolean(
        credentialDetail.schema.walletAttestation.keyStorageSecurityLevel,
      ),
      {
        attributeKey: translate('common.storageType'),
        attributeText:
          credentialDetail.schema.walletAttestation.keyStorageSecurityLevel ??
          'UNKNOWN',
        testID: 'storageType',
      },
    ),
    {
      attributeKey: translate('common.credentialSchema'),
      attributeText: JSON.stringify(credentialSchemaWithoutImages, null, 1),
      canBeCopied: true,
      testID: 'schema',
    },
  ];

  return (
    <NerdModeScreen
      entityCluster={{
        translate: orgDetail?.configuration?.enforceEcosystemAsHolder === false,
        trustInfoLabels: trustInfoLabels(),
        trustInformation: credentialDetail.trustInformation,
        trustInformationDetail: trustInformation?.issuer,
      }}
      labels={attributesLabels}
      language={language}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      onOpenTrustInfoDetails={trustDetailsPressHandler}
      sections={[
        {
          data: nerdModeFields,
          title: translate('common.credential'),
        },
      ]}
      testID="CredentialNerdView"
      title={translate('common.moreInformation')}
    />
  );
};

const styles = StyleSheet.create({
  validityEntryContainer: {
    flexDirection: 'row',
  },
  validityEntryText: {
    marginLeft: 8,
  },
});

export default CredentialDetailNerdScreen;
