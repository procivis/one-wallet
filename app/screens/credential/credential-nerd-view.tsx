import {
  ColorScheme,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { ActivityIndicator } from '@procivis/react-native-components';
import {
  CredentialDetail,
  CredentialStateEnum,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  CredentialSuspendedIcon,
  CredentialSuspendedTempIcon,
  CredentialValidIcon,
} from '../../components/icon/nerd-view-icon';
import { NerdModeItemProps } from '../../components/nerd-view/nerd-mode-item';
import { NerdModeView } from '../../components/nerd-view/nerd-mode-view';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import { CredentialDetailRouteProp } from '../../navigators/credential-detail/credential-detail-routes';

const getCredentialValidityValue = (
  credential: CredentialDetail,
  colorScheme: ColorScheme,
): { icon: ReactElement; text: string; textColor: string } => {
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

  // Should never occur
  return {
    icon: <></>,
    text: 'UNKNOWN',
    textColor: colorScheme.white,
  };
};

const CredentialNerdView: FunctionComponent = () => {
  const nav = useNavigation();
  const colorScheme = useAppColorScheme();
  const route = useRoute<CredentialDetailRouteProp<'CredentialNerdView'>>();

  const { credentialId } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialId);

  if (!credentialDetail) {
    return <ActivityIndicator />;
  }

  const [did, ...didMethodId] =
    credentialDetail.issuerDid?.split(':').reverse() ?? [];

  const { text, textColor, icon } = getCredentialValidityValue(
    credentialDetail,
    colorScheme,
  );

  const nerdModeFields: Array<NerdModeItemProps> = [
    {
      attributeKey: translate('credentialDetail.credential.schema'),
      highlightedText: credentialDetail.schema.name,
    },
    {
      attributeKey: translate('credentialDetail.credential.format'),
      attributeText: credentialDetail.schema.format,
    },
    {
      attributeKey: translate('credentialDetail.credential.issuerDid'),
      attributeText: did,
      canBeCopied: true,
      highlightedText: didMethodId.reverse().join(':') + ':',
    },
    {
      attributeKey: translate('credentialDetail.credential.revocationMethod'),
      attributeText: credentialDetail.schema.revocationMethod,
    },
    {
      attributeKey: translate('credentialDetail.credential.validity'),
      element: (
        <View style={styles.validityEntryContainer}>
          {icon}
          <Typography
            color={textColor}
            preset="s/code"
            style={styles.validityEntryText}
          >
            {text}
          </Typography>
        </View>
      ),
    },
  ];

  return (
    <NerdModeView
      entityCluster={{
        entityName:
          credentialDetail?.issuerDid ??
          translate('credentialOffer.unknownIssuer'),
      }}
      onClose={nav.goBack}
      sections={[
        {
          data: nerdModeFields,
          title: translate('credentialDetail.nerdView.attributes.title'),
        },
      ]}
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

export const CredentialDetailNerdView = CredentialNerdView;
