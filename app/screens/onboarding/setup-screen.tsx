/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */

import {
  Button,
  ButtonType,
  ContrastingStatusBar,
  CredentialCardShadow,
  CredentialDetailsCard,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
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
  credentialDetailPrimary: string;
  credentialDetailSecondary: string;
  name: string;
  style?: StyleProp<ViewStyle>;
}> = ({
  name,
  credentialDetailPrimary,
  credentialDetailSecondary,
  style,
  bgImageIndex,
}) => {
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <CredentialDetailsCard
      attributes={[]}
      card={{
        cardImage: {
          imageSource: BG_IMAGES[bgImageIndex].imageSource,
        },
        color: BG_IMAGES[bgImageIndex].color,
        header: {
          accessory: <View />,
          credentialDetailPrimary,
          credentialDetailSecondary,
          credentialName: name,
          iconLabelColor: '#000',
        },
        width,
      }}
      onLayout={onLayout}
      style={style}
    />
  );
};

export const SetupScreen: FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'Setup'>>();
  const rootNavigation = useNavigation<RootNavigationProp<'Onboarding'>>();
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
          screen: 'RestoreBackupDashboard',
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
        <View style={[styles.topCredential, styles.credential]}>
          <DummyCredential
            bgImageIndex={0}
            credentialDetailPrimary="... 0987"
            credentialDetailSecondary="DEBIT"
            name={'Bank ID'}
          />
        </View>
        <View style={[styles.bottomCredential, styles.credential]}>
          <DummyCredential
            bgImageIndex={1}
            credentialDetailPrimary="30.06.1990"
            credentialDetailSecondary="CHE"
            name={'National Identity'}
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: colorScheme.white,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={styles.text}>
          <Typography color={colorScheme.black} preset="l/line-height-large">
            {translate('info.onboarding.setup.title')}
          </Typography>
          <Typography color={colorScheme.text} style={styles.description}>
            {translate('info.onboarding.setup.description')}
          </Typography>
        </View>
        <View style={styles.buttons}>
          <Button
            onPress={onSetup}
            testID="OnboardingSetupScreen.setup"
            title={translate('common.createNewWallet')}
          />
          <Button
            onPress={onRestore}
            style={styles.secondaryButton}
            testID="OnboardingSetupScreen.restore"
            title={translate('common.restoreWalletBackup')}
            type={ButtonType.Secondary}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomCredential: {
    bottom: 30,
    left: 5,
    transform: [{ scale: 0.8 }, { rotate: '-17deg' }],
  },
  buttons: {
    padding: 12,
    paddingBottom: 11,
  },
  credential: {
    ...CredentialCardShadow,
    alignSelf: 'center',
    position: 'absolute',
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
  screen: {
    flex: 1,
  },
  secondaryButton: {
    marginTop: 4,
  },
  text: {
    marginBottom: 24,
    padding: 20,
    paddingBottom: 24,
  },
  top: {
    flex: 1,
    paddingTop: 100,
  },
  topCredential: {
    right: 5,
    top: 15,
    transform: [{ scale: 0.8 }, { rotate: '20deg' }],
  },
});
