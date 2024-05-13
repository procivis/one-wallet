import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';

import NerdModeScreen from '../../components/screens/nerd-mode-screen';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';

const ErrorNerdScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<NerdModeRouteProp<'ErrorNerdMode'>>();

  const { error } = route.params;

  const sections = [
    {
      data: [
        {
          attributeKey: translate('invitationError.code'),
          canBeCopied: true,
          highlightedText: error.code,
        },
        {
          attributeKey: translate('invitationError.message'),
          attributeText: error.message,
          canBeCopied: true,
        },
        {
          attributeKey: translate('invitationError.cause'),
          attributeText: (error.cause as any)?.message,
          canBeCopied: true,
        },
      ],
      title: translate('invitationError.error'),
    },
  ];

  return (
    <NerdModeScreen
      onClose={navigation.goBack}
      sections={sections}
      testID="InvitationErrorDetailsScreen"
      title={translate('invitationError.title')}
    />
  );
};

export default ErrorNerdScreen;
