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

import BiometricLoginIcon from '../../../assets/images/settings/biometricLogin';
import DeleteWalletIcon from '../../../assets/images/settings/deleteWallet';
import InfoIcon from '../../../assets/images/settings/info';
import LanguageIcon from '../../../assets/images/settings/language';
import PincodeIcon from '../../../assets/images/settings/pincode';
import { useBiometricType } from '../../components/pin-code/biometric';
import { useExplicitPinCodeCheck } from '../../components/pin-code/pin-code-check';
import { Locale, Locales, translate, TxKeyPath } from '../../i18n';
import { useStores } from '../../models';
import { SettingsNavigationProp } from '../../navigators/root/settings/settings-routes';

const LocaleNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
};

interface SectionHeaderProps {
  title: TxKeyPath;
}

const SectionHeader: FunctionComponent<SectionHeaderProps> = ({ title }) => {
  const colorScheme = useAppColorScheme();
  return (
    <Typography accessibilityRole="header" size="sml" color={colorScheme.text} style={styles.sectionHeader}>
      {translate(title)}
    </Typography>
  );
};

const SettingsScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'SettingsDashboard'>>();

  const { userSettings, locale } = useStores();
  const biometry = useBiometricType();

  const { showActionSheetWithOptions } = useActionSheet();
  const handleChangeLanguage = useCallback(() => {
    // all locales, currently selected as first
    const allLocales = Locales.filter((x) => x !== locale.locale);
    allLocales.unshift(locale.locale);
    const options = [...allLocales.map((l) => LocaleNames[l]), translate('common.cancel')];
    const destructiveButtonIndex = 0; // current language
    const cancelButtonIndex = options.length - 1;
    showActionSheetWithOptions({ options, destructiveButtonIndex, cancelButtonIndex }, (buttonIndex) => {
      if (buttonIndex !== undefined && buttonIndex !== destructiveButtonIndex && buttonIndex !== cancelButtonIndex) {
        const newLocale = allLocales[buttonIndex];
        locale.changeLocale(newLocale);
      }
    });
  }, [locale, showActionSheetWithOptions]);

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
      key={locale.locale}
      onBack={navigation.goBack}
      style={{ backgroundColor: colorScheme.white }}
      contentStyle={styles.fullWidth}
      title={
        <TapGestureHandler numberOfTaps={5}>
          <Typography accessibilityRole="header" size="h1" color={colorScheme.text} bold={true}>
            {translate('wallet.settings.title')}
          </Typography>
        </TapGestureHandler>
      }>
      <SectionHeader title={'wallet.settings.general.title'} />
      <ButtonSetting
        title={translate('wallet.settings.general.language')}
        onPress={handleChangeLanguage}
        icon={<LanguageIcon />}
      />

      <SectionHeader title={'wallet.settings.security.title'} />
      <ButtonSetting
        title={translate('wallet.settings.security.pincode')}
        onPress={handlePinCodeChange}
        icon={<PincodeIcon />}
      />
      {biometry ? (
        <SwitchSetting
          title={translate('wallet.settings.security.biometricLogin')}
          value={userSettings.biometricLogin}
          onChange={handleBiometricLoginChange}
          icon={<BiometricLoginIcon />}
        />
      ) : null}

      <SectionHeader title={'wallet.settings.help.title'} />
      <ButtonSetting
        title={translate('wallet.settings.help.information')}
        onPress={handleAppInformation}
        icon={<InfoIcon />}
      />

      <SectionHeader title={'wallet.settings.profile.title'} />
      <ButtonSetting
        title={translate('wallet.settings.profile.deleteWallet')}
        onPress={handleDeleteWallet}
        icon={<DeleteWalletIcon />}
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
