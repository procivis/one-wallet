import {
  ActivityIndicator,
  ColorScheme,
  CredentialSuspendedIcon,
  CredentialSuspendedTempIcon,
  CredentialValidIcon,
  getCredentialSchemaWithoutImages,
  NerdModeItemProps,
  NerdModeScreen,
  Typography,
  useAppColorScheme,
  useCredentialDetail,
} from '@procivis/one-react-native-components';
import {
  CredentialDetail,
  CredentialStateEnum,
  TrustEntityRoleEnum,
} from '@procivis/react-native-one-core';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { addElementIf } from '../../utils/array';
import { formatDateTimeLocalized } from '../../utils/date';
import { attributesLabels, entityLabels } from './utils';

const getCredentialValidityValue = (
  credential: CredentialDetail,
  colorScheme: ColorScheme,
): { icon: ReactElement; text: string; textColor: string } | undefined => {
  if (credential.state === CredentialStateEnum.SUSPENDED) {
    if (credential.suspendEndDate) {
      return {
        icon: CredentialSuspendedTempIcon,
        text: translate('credentialDetail.validity.suspendedUntil', {
          date: credential.suspendEndDate,
        }),
        textColor: colorScheme.warning,
      };
    } else {
      return {
        icon: CredentialSuspendedIcon,
        text: translate('credentialDetail.validity.suspended'),
        textColor: colorScheme.warning,
      };
    }
  }

  if (credential.state === CredentialStateEnum.REVOKED) {
    return {
      icon: CredentialSuspendedIcon,
      text: translate('credentialDetail.validity.revoked'),
      textColor: colorScheme.error,
    };
  }

  if (credential.state === CredentialStateEnum.ACCEPTED) {
    return {
      icon: CredentialValidIcon,
      text: translate('credentialDetail.validity.valid'),
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

  const { credentialId } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialId);

  if (!credentialDetail) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const didId = credentialDetail.issuerDid?.did || '';
  const didSections = didId.split(':') ?? [];
  const identifier = didSections.pop();
  const didMethod = didSections.length ? didSections.join(':') + ':' : '';

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
      attributeKey: translate('credentialDetail.credential.schema'),
      highlightedText: credentialDetail.schema.name,
      testID: 'schemaName',
    },
    ...addElementIf(!!validityData, {
      attributeKey: translate('credentialDetail.credential.validity'),
      element: (
        <View style={styles.validityEntryContainer}>
          {validityData?.icon}
          <Typography
            color={validityData?.textColor || ''}
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
    ...addElementIf(Boolean(didMethod), {
      attributeKey: translate('credentialDetail.credential.issuerDid'),
      attributeText: identifier,
      canBeCopied: true,
      highlightedText: didMethod,
      testID: 'issuerDID',
    }),
    {
      attributeKey: translate('credentialDetail.credential.dateAdded'),
      attributeText: formatDateTimeLocalized(
        new Date(credentialDetail?.createdDate),
      ),
      testID: 'dateAdded',
    },
    {
      attributeKey: translate('credentialDetail.credential.format'),
      attributeText: credentialDetail.schema.format,
      testID: 'credentialFormat',
    },
    {
      attributeKey: translate('credentialDetail.credential.documentType'),
      attributeText: credentialDetail.schema.schemaId,
      testID: 'documentType',
    },
    {
      attributeKey: translate('credentialDetail.credential.revocationMethod'),
      attributeText: credentialDetail.schema.revocationMethod,
      testID: 'revocationMethod',
    },
    {
      attributeKey: translate('credentialDetail.credential.storageType'),
      attributeText: credentialDetail.schema.walletStorageType,
      testID: 'storageType',
    },
    {
      attributeKey: translate('credentialDetail.credential.schema'),
      attributeText: JSON.stringify(credentialSchemaWithoutImages, null, 1),
      canBeCopied: true,
      testID: 'schema',
    },
  ];

  return (
    <NerdModeScreen
      entityCluster={{
        did: credentialDetail.issuerDid!,
        entityLabels: entityLabels,
        role: TrustEntityRoleEnum.ISSUER,
      }}
      labels={attributesLabels}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={[
        {
          data: nerdModeFields,
          title: translate('credentialDetail.nerdView.attributes.title'),
        },
      ]}
      testID="CredentialNerdView"
      title={translate('credentialDetail.action.moreInfo')}
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
