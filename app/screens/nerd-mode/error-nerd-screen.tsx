import {
  NerdModeScreen,
  NerdModeSection,
  reportException,
} from '@procivis/one-react-native-components';
import { OneError } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useMemo } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { attributesLabels } from './utils';

const getDataFields = (error: unknown): NerdModeSection['data'] => {
  if (error instanceof OneError) {
    const result = [
      {
        attributeKey: translate('errorDetail.code'),
        canBeCopied: true,
        highlightedText: error.code,
      },
      {
        attributeKey: translate('errorDetail.message'),
        attributeText: error.message,
        canBeCopied: true,
      },
    ];

    if (error.cause) {
      result.push({
        attributeKey: translate('errorDetail.cause'),
        attributeText: error.cause,
        canBeCopied: true,
      });
    }

    return result;
  }

  if (error instanceof Error) {
    return [
      {
        attributeKey: translate('errorDetail.name'),
        canBeCopied: true,
        highlightedText: error.name,
      },
      {
        attributeKey: translate('errorDetail.message'),
        attributeText: error.message,
        canBeCopied: true,
      },
    ];
  }

  let message = 'Unknown error';
  try {
    message = JSON.stringify(error);
  } catch (e) {
    reportException(e, 'Formatting unknown error');
  }

  return [
    {
      attributeKey: translate('errorDetail.message'),
      attributeText: message,
      canBeCopied: true,
    },
  ];
};

const ErrorNerdScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<NerdModeRouteProp<'ErrorNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();

  const { error } = route.params;

  const sections = useMemo<NerdModeSection[]>(
    () => [
      {
        data: getDataFields(error),
        title: translate('errorDetail.error'),
      },
    ],
    [error],
  );

  return (
    <NerdModeScreen
      labels={attributesLabels}
      onClose={navigation.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={sections}
      testID="InvitationErrorDetailsScreen"
      title={translate('errorDetail.title')}
    />
  );
};

export default ErrorNerdScreen;
