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

import { RevocationMethod } from '../../../e2e/utils/enums';
import {
  CredentialSuspendedIcon,
  CredentialSuspendedTempIcon,
  CredentialValidIcon,
} from '../../components/icon/nerd-view-icon';
import { NerdModeItemProps } from '../../components/nerd-view/nerd-mode-item';
import NerdModeScreen from '../../components/screens/nerd-mode-screen';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';

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
  const nav = useNavigation();
  const colorScheme = useAppColorScheme();
  const route = useRoute<NerdModeRouteProp<'CredentialNerdMode'>>();

  const { credentialId } = route.params;
  const { data: credentialDetail } = useCredentialDetail(credentialId);

  if (!credentialDetail) {
    return <ActivityIndicator />;
  }

  const didSections = credentialDetail.issuerDid?.split(':') ?? [];
  const identifier = didSections.pop();
  const didMethod = didSections.join(':') + ':';

  const nerdModeFields: Array<NerdModeItemProps> = [
    {
      attributeKey: translate('credentialDetail.credential.schema'),
      highlightedText: credentialDetail.schema.name,
      testID: 'schemaName',
    },
    {
      attributeKey: translate('credentialDetail.credential.issuerDid'),
      attributeText: identifier,
      canBeCopied: true,
      highlightedText: didMethod,
      testID: 'issuerDID',
    },
    {
      attributeKey: translate('credentialDetail.credential.format'),
      attributeText: credentialDetail.schema.format,
      testID: 'credentialFormat',
    },
    {
      attributeKey: translate('credentialDetail.credential.revocationMethod'),
      attributeText: translate(
        `credentialDetail.credential.revocation.${
          credentialDetail.schema.revocationMethod as RevocationMethod
        }`,
      ),
      testID: 'revocationMethod',
    },
  ];

  const validityData = getCredentialValidityValue(
    credentialDetail,
    colorScheme,
  );

  if (validityData) {
    const { icon, text, textColor } = validityData;

    nerdModeFields.push({
      attributeKey: translate('credentialDetail.credential.validity'),
      element: (
        <View style={styles.validityEntryContainer}>
          {icon}
          <Typography
            color={textColor}
            preset="s/code"
            style={styles.validityEntryText}
            testID="CredentialNerdView.validity.attributeValue"
          >
            {text}
          </Typography>
        </View>
      ),
      testID: 'validity',
    });
  }

  return (
    <NerdModeScreen
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
