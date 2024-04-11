import {
  Button,
  ContrastingStatusBar,
  Header,
  Switch,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Biometry,
  useBiometricType,
  useFaceIDPermission,
} from '../../hooks/pin-code/biometric';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';

export const SecurityScreen: FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'Security'>>();
  const colorScheme = useAppColorScheme();

  const biometryTypeSupported = useBiometricType();
  const { userSettings } = useStores();
  const [biometryEnabled, setBiometryEnabled] = useState(true);
  const faceIdPermission = useFaceIDPermission();

  const biometryDisplayed = Boolean(
    biometryTypeSupported &&
      (biometryTypeSupported !== Biometry.FaceID ||
        faceIdPermission.status === RESULTS.GRANTED ||
        faceIdPermission.status === RESULTS.DENIED),
  );

  const onContinue = useCallback(async () => {
    if (biometryDisplayed) {
      let settingEnabled = biometryEnabled;
      if (biometryEnabled && biometryTypeSupported === Biometry.FaceID) {
        settingEnabled = await faceIdPermission.request().catch(() => false);
      }
      userSettings.switchBiometrics(settingEnabled);
    }
    navigation.navigate('PinCodeInitialization');
  }, [
    biometryDisplayed,
    biometryEnabled,
    navigation,
    userSettings,
    biometryTypeSupported,
    faceIdPermission,
  ]);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colorScheme.white }]}
      testID="SecurityScreen"
    >
      <ContrastingStatusBar backgroundColor={colorScheme.white} />
      <Header
        onBack={navigation.goBack}
        text={{}}
        title={translate('onboarding.security.title')}
      />
      <View style={styles.top}>
        <Typography color={colorScheme.text}>
          {translate('onboarding.security.subtitle')}
        </Typography>
      </View>

      <View style={styles.bottom}>
        {biometryDisplayed ? (
          <View
            style={[styles.toggle, { backgroundColor: colorScheme.background }]}
          >
            <Typography
              color={colorScheme.text}
              preset="xs/line-height-small"
              style={styles.toggleLabel}
            >
              {translate('onboarding.security.biometry')}
            </Typography>
            <Switch
              onChange={setBiometryEnabled}
              style={styles.switch}
              testID="SecurityScreen.biometryToggle"
              value={biometryEnabled}
            />
          </View>
        ) : null}
        <Button
          onPress={onContinue}
          style={styles.button}
          testID="SecurityScreen.continue"
          title={translate('onboarding.security.continue')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottom: {
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 12,
  },
  screen: {
    flex: 1,
  },
  switch: {
    marginLeft: 12,
  },
  toggle: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  toggleLabel: {
    flex: 1,
  },
  top: {
    flex: 1,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
});
