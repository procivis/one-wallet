import { OneError } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';

import NerdModeScreen, {
  NerdModeSection,
} from '../../components/screens/nerd-mode-screen';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';

const ErrorNerdScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<NerdModeRouteProp<'ErrorNerdMode'>>();

  const { error } = route.params;

  const sections: NerdModeSection[] = [];
  if (error instanceof OneError) {
    sections.push({
      data: [
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
        {
          attributeKey: translate('errorDetail.cause'),
          attributeText: (error.cause as any)?.message,
          canBeCopied: true,
        },
      ],
      title: translate('errorDetail.error'),
    });
  } else if (
    typeof error === 'object' &&
    error &&
    'name' in error &&
    'message' in error
  ) {
    sections.push({
      data: [
        {
          attributeKey: translate('errorDetail.name'),
          canBeCopied: true,
          highlightedText: (error as any).name as string,
        },
        {
          attributeKey: translate('errorDetail.message'),
          attributeText: (error as any).message as string,
          canBeCopied: true,
        },
      ],
      title: translate('errorDetail.error'),
    });
  } else {
    sections.push({
      data: [
        {
          attributeKey: translate('errorDetail.message'),
          attributeText: JSON.stringify(error),
          canBeCopied: true,
        },
      ],
      title: translate('errorDetail.error'),
    });
  }

  return (
    <NerdModeScreen
      onClose={navigation.goBack}
      sections={sections}
      testID="InvitationErrorDetailsScreen"
      title={translate('errorDetail.title')}
    />
  );
};

export default ErrorNerdScreen;
