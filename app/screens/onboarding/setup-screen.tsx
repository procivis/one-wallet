import { ConsentScreen } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';

import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';

const SetupScreen: FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'Setup'>>();

  return (
    <ConsentScreen
      buttons={[
        {
          onPress: () => navigation.navigate('PinCodeInitialization'),
          title: translate('onboarding.setup.getStarted'),
        },
        {
          // TODO: navigate to restore from backup screen
          onPress: () => navigation.navigate('PinCodeInitialization'),
          title: translate('onboarding.setup.restoreFromBackup'),
        },
      ]}
      description={translate('onboarding.setup.description')}
      illustration={{
        // TODO: replace with actual illustration
        imageSource: require('./assets/setup-illustration.png'),
      }}
      testID="OnboardingSetupScreen"
      title={translate('onboarding.setup.title')}
    />
  );
};

export default SetupScreen;
