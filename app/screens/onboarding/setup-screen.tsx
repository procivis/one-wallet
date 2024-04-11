import {
  Button,
  ButtonType,
  ContrastingStatusBar,
  CredentialDetailsCard,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

const BG_IMAGES = [
  {
    color: '#C2CDF1',
    imageSource: require('../../../assets/credential-background/01.png'),
  },
  {
    color: '#E5C7A6',
    imageSource: require('../../../assets/credential-background/05.png'),
  },
];

const DummyCredential: FC<{
  bgImageIndex: number;
  detail: string;
  name: string;
  style?: StyleProp<ViewStyle>;
}> = ({ name, detail, style, bgImageIndex }) => (
  <CredentialDetailsCard
    attributes={[]}
    card={{
      cardImage: {
        imageSource: BG_IMAGES[bgImageIndex].imageSource,
      },
      color: BG_IMAGES[bgImageIndex].color,
      header: {
        accessory: <View />,
        credentialDetail: detail,
        credentialName: name,
        iconLabelColor: '#000',
      },
    }}
    style={style}
  />
);

export const SetupScreen: FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'Setup'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Settings'>>();
  const colorScheme = useAppColorScheme();
  const insets = useSafeAreaInsets();

  const onSetup = useCallback(
    () => navigation.navigate('UserAgreement'),
    [navigation],
  );
  const onRestore = useCallback(
    () =>
      rootNavigation.navigate('Settings', {
        params: {
          screen: 'Dashboard',
        },
        screen: 'RestoreBackup',
      }),
    [rootNavigation],
  );

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colorScheme.background, paddingTop: insets.top },
      ]}
      testID="OnboardingSetupScreen"
    >
      <ContrastingStatusBar backgroundColor={colorScheme.background} />
      <View accessibilityElementsHidden={true} style={styles.top}>
        <DummyCredential
          bgImageIndex={0}
          detail={'... 0987  ·  DEBIT'}
          name={'Bank ID'}
          style={styles.credential1}
        />
        <DummyCredential
          bgImageIndex={1}
          detail={'30.06.1990  ·  CHE'}
          name={'National Identity'}
          style={styles.credential2}
        />
      </View>
      <View
        style={{
          backgroundColor: colorScheme.white,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={styles.text}>
          <Typography color={colorScheme.black} preset="l/line-height-large">
            {translate('onboarding.setup.title')}
          </Typography>
          <Typography color={colorScheme.text} style={styles.description}>
            {translate('onboarding.setup.description')}
          </Typography>
        </View>
        <View style={styles.buttons}>
          <Button
            onPress={onSetup}
            testID="OnboardingSetupScreen.setup"
            title={translate('onboarding.setup.getStarted')}
          />
          <Button
            onPress={onRestore}
            style={styles.secondaryButton}
            testID="OnboardingSetupScreen.restore"
            title={translate('onboarding.setup.restoreFromBackup')}
            type={ButtonType.Secondary}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    padding: 12,
    paddingBottom: 24,
  },
  credential1: {
    position: 'absolute',
    transform: [{ scale: 0.75 }, { rotate: '20deg' }],
  },
  credential2: {
    bottom: 20,
    position: 'absolute',
    transform: [{ scale: 0.75 }, { rotate: '-17deg' }],
  },
  description: {
    marginBottom: 24,
    marginTop: 8,
  },
  screen: {
    flex: 1,
  },
  secondaryButton: {
    marginTop: 4,
  },
  text: {
    padding: 20,
    paddingBottom: 24,
  },
  top: {
    flex: 1,
  },
});
