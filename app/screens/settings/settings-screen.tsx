import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ButtonSetting,
  FeatureScreen,
  SwitchSetting,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';

import {
  DeleteIcon,
  FaceIDIcon,
  InformationIcon,
  LanguageIcon,
  PINIcon,
  TouchIDIcon,
} from '../../components/icon/settings-icon';
import {
  Biometry,
  useBiometricType,
} from '../../components/pin-code/biometric';
import { useExplicitPinCodeCheck } from '../../components/pin-code/pin-code-check';
import { Locale, Locales, useUpdatedTranslate } from '../../i18n';
import { useStores } from '../../models';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const LocaleNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};

const SectionHeader: FunctionComponent<{ title: string }> = ({ title }) => {
  const colorScheme = useAppColorScheme();
  return (
    <Typography
      accessibilityRole="header"
      color={colorScheme.text}
      size="sml"
      style={styles.sectionHeader}
    >
      {title}
    </Typography>
  );
};

const SettingsScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<SettingsNavigationProp<'SettingsDashboard'>>();

  const { userSettings, locale } = useStores();
  const translate = useUpdatedTranslate();
  const biometry = useBiometricType();

  const { showActionSheetWithOptions } = useActionSheet();
  const handleChangeLanguage = useCallback(() => {
    // all locales, currently selected as first
    const allLocales = Locales.filter((x) => x !== locale.locale);
    allLocales.unshift(locale.locale);
    const options = [
      ...allLocales.map((l) => LocaleNames[l]),
      translate('common.cancel'),
    ];
    const destructiveButtonIndex = 0; // current language
    const cancelButtonIndex = options.length - 1;
    showActionSheetWithOptions(
      { cancelButtonIndex, destructiveButtonIndex, options },
      (buttonIndex) => {
        if (
          buttonIndex !== undefined &&
          buttonIndex !== destructiveButtonIndex &&
          buttonIndex !== cancelButtonIndex
        ) {
          const newLocale = allLocales[buttonIndex];
          locale.changeLocale(newLocale);
        }
      },
    );
  }, [locale, showActionSheetWithOptions, translate]);

  const handlePinCodeChange = useCallback(() => {
    navigation.navigate('PinCodeChange');
  }, [navigation]);

  const handleAppInformation = useCallback(() => {
    navigation.navigate('AppInformation');
  }, [navigation]);

  const handleDeleteWallet = useCallback(() => {
    navigation.navigate('DeleteWallet');
  }, [navigation]);

  const runAfterPinCheck = useExplicitPinCodeCheck();
  const handleBiometricLoginChange = useCallback(
    (enabled: boolean) => {
      runAfterPinCheck(
        () => {
          userSettings.switchBiometricLogin(enabled);
        },
        { disableBiometry: true },
      );
    },
    [runAfterPinCheck, userSettings],
  );

  return (
    <FeatureScreen
      contentStyle={styles.fullWidth}
      onBack={navigation.goBack}
      style={{ backgroundColor: colorScheme.white }}
      title={
        <TapGestureHandler numberOfTaps={5}>
          <Typography
            accessibilityRole="header"
            bold={true}
            color={colorScheme.text}
            size="h1"
          >
            {translate('wallet.settings.title')}
          </Typography>
        </TapGestureHandler>
      }
    >
      <SectionHeader title={translate('wallet.settings.general.title')} />
      <ButtonSetting
        icon={<LanguageIcon />}
        onPress={handleChangeLanguage}
        title={translate('wallet.settings.general.language')}
      />

      <SectionHeader title={translate('wallet.settings.security.title')} />
      <ButtonSetting
        icon={<PINIcon />}
        onPress={handlePinCodeChange}
        title={translate('wallet.settings.security.pinCode')}
      />
      {biometry ? (
        <SwitchSetting
          icon={biometry === Biometry.FaceID ? <FaceIDIcon /> : <TouchIDIcon />}
          onChange={handleBiometricLoginChange}
          title={translate('wallet.settings.security.biometricLogin')}
          value={userSettings.biometricLogin}
        />
      ) : null}

      <SectionHeader title={translate('wallet.settings.help.title')} />
      <ButtonSetting
        icon={<InformationIcon />}
        onPress={handleAppInformation}
        title={translate('wallet.settings.help.information')}
      />

      <SectionHeader title={translate('wallet.settings.profile.title')} />
      <ButtonSetting
        icon={<DeleteIcon />}
        onPress={handleDeleteWallet}
        title={translate('wallet.settings.profile.deleteWallet')}
      />
    </FeatureScreen>
  );
});

const styles = StyleSheet.create({
  fullWidth: {
    paddingHorizontal: 0,
  },
  sectionHeader: {
    margin: 24,
    marginBottom: 4,
  },
});

export default SettingsScreen;
