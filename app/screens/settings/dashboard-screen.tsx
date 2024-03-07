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
  BackupIcon,
  DeleteIcon,
  FaceIDIcon,
  HistoryIcon,
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

const DashboardScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'Dashboard'>>();
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

  const handleHistory = useCallback(() => {
    navigation.navigate('History', { screen: 'Dashboard' });
  }, [navigation]);

  const handleCreateBackup = useCallback(() => {
    navigation.navigate('CreateBackup', { screen: 'Dashboard' });
  }, [navigation]);

  const handleChangePinCode = useCallback(() => {
    navigation.navigate('PinCodeChange');
  }, [navigation]);

  const runAfterPinCheck = useExplicitPinCodeCheck();
  const handleBiometrics = useCallback(
    (enabled: boolean) => {
      runAfterPinCheck(
        () => {
          userSettings.switchBiometrics(enabled);
          navigation.navigate('BiometricsSet', { enabled });
        },
        { disableBiometry: true },
      );
    },
    [navigation, runAfterPinCheck, userSettings],
  );

  const handleAppInformation = useCallback(() => {
    navigation.navigate('AppInformation');
  }, [navigation]);

  const handleDeleteWallet = useCallback(() => {
    navigation.navigate('DeleteWallet');
  }, [navigation]);

  return (
    <FeatureScreen
      contentStyle={styles.fullWidth}
      onBack={navigation.goBack}
      style={{ backgroundColor: colorScheme.white }}
      testID="SettingsScreen"
      title={
        <TapGestureHandler numberOfTaps={5}>
          <Typography
            accessibilityRole="header"
            bold={true}
            color={colorScheme.text}
            size="h1"
          >
            {translate('settings.title')}
          </Typography>
        </TapGestureHandler>
      }
    >
      <SectionHeader title={translate('settings.general.title')} />
      <ButtonSetting
        icon={<LanguageIcon />}
        onPress={handleChangeLanguage}
        testID="SettingsScreen.languageChange"
        title={translate('settings.general.language')}
      />
      <ButtonSetting
        icon={<HistoryIcon />}
        onPress={handleHistory}
        testID="SettingsScreen.history"
        title={translate('settings.general.history')}
      />

      <SectionHeader title={translate('settings.backup.title')} />
      <ButtonSetting
        icon={<BackupIcon />}
        onPress={handleCreateBackup}
        testID="SettingsScreen.createBackup"
        title={translate('settings.backup.createBackup')}
      />

      <SectionHeader title={translate('settings.security.title')} />
      <ButtonSetting
        icon={<PINIcon />}
        onPress={handleChangePinCode}
        testID="SettingsScreen.changePIN"
        title={translate('settings.security.pinCode')}
      />
      {biometry ? (
        <SwitchSetting
          icon={biometry === Biometry.FaceID ? <FaceIDIcon /> : <TouchIDIcon />}
          onChange={handleBiometrics}
          title={translate('settings.security.biometrics')}
          value={userSettings.biometrics}
        />
      ) : null}

      <SectionHeader title={translate('settings.help.title')} />
      <ButtonSetting
        icon={<InformationIcon />}
        onPress={handleAppInformation}
        testID="SettingsScreen.help"
        title={translate('settings.help.information')}
      />

      <SectionHeader title={translate('settings.profile.title')} />
      <ButtonSetting
        icon={<DeleteIcon />}
        onPress={handleDeleteWallet}
        testID="SettingsScreen.deleteWallet"
        title={translate('settings.profile.deleteWallet')}
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

export default DashboardScreen;
