import { ConsentScreen } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';

import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const SetupScreen: FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'Setup'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();

  return (
    <ConsentScreen
      buttons={[
        {
          onPress: () => navigation.navigate('PinCodeInitialization'),
          testID: 'OnboardingSetupScreen.setup',
          title: translate('onboarding.setup.getStarted'),
        },
        {
          onPress: () =>
            rootNavigation.navigate('Settings', {
              params: {
                screen: 'Dashboard',
              },
              screen: 'RestoreBackup',
            }),
          testID: 'OnboardingSetupScreen.restore',
          title: translate('onboarding.setup.restoreFromBackup'),
        },
      ]}
      description={translate('onboarding.setup.description')}
      illustration={{
        imageSource: require('./assets/setup-illustration.png'),
      }}
      testID="OnboardingSetupScreen"
      title={translate('onboarding.setup.title')}
    />
  );
};

export default SetupScreen;
