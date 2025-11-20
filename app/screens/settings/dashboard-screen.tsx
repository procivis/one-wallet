import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  ButtonSetting,
  ButtonSettingProps,
  ListSectionHeader,
  ListSectionHeaderProps,
  SectionListScreen,
  SettingItemSeparator,
  SwitchSetting,
  SwitchSettingProps,
  useAppColorScheme,
  WalletUnitAttestationIcon,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback } from 'react';
import {
  SectionListProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  ClearCacheIcon,
  CreateBackupIcon,
  DeleteIcon,
  FaceIDIcon,
  HistoryIcon,
  InformationIcon,
  LanguageIcon,
  LicencesIcon,
  PINIcon,
  RestoreBackupIcon,
  ScreenCaptureProtectionIcon,
  TouchIDIcon,
} from '../../components/icon/settings-icon';
import { HeaderBackButton } from '../../components/navigation/header-buttons';
import { config } from '../../config';
import { Biometry, useBiometricType } from '../../hooks/pin-code/biometric';
import { useBiometricSetting } from '../../hooks/settings/biometric';
import { useUpdatedTranslate } from '../../hooks/updated-translate';
import { Locale, Locales } from '../../i18n';
import { useStores } from '../../models';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { nonEmptyFilter } from '../../utils/filtering';

const LocaleNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};

const DashboardScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<SettingsNavigationProp<'SettingsDashboard'>>();
  const {
    userSettings,
    locale,
    walletStore,
    walletStore: {
      walletProvider: { walletUnitAttestation },
    },
  } = useStores();
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
    const disabledButtonIndices = [
      allLocales.findIndex((l) => l === locale.locale),
    ];
    const cancelButtonIndex = options.length - 1;
    showActionSheetWithOptions(
      {
        cancelButtonIndex,
        disabledButtonIndices,
        options,
      },
      (buttonIndex) => {
        if (buttonIndex !== undefined && buttonIndex !== cancelButtonIndex) {
          const newLocale = allLocales[buttonIndex];
          locale.changeLocale(newLocale);
        }
      },
    );
  }, [locale, showActionSheetWithOptions, translate]);

  const handleHistory = useCallback(() => {
    navigation.navigate('History', { screen: 'HistoryDashboard' });
  }, [navigation]);

  const handleCreateBackup = useCallback(() => {
    navigation.navigate('CreateBackup', { screen: 'CreateBackupDashboard' });
  }, [navigation]);

  const handleRestoreBackup = useCallback(() => {
    navigation.navigate('RestoreBackup', { screen: 'RestoreBackupDashboard' });
  }, [navigation]);

  const handleChangePinCode = useCallback(() => {
    navigation.navigate('PinCodeChange');
  }, [navigation]);

  const handleChangeRSEPinCode = useCallback(() => {
    navigation.navigate('RSEPinCodeChange');
  }, [navigation]);

  const biometricSetting = useBiometricSetting();

  const handleScreenCaptureProtectionChange = useCallback(() => {
    userSettings.switchScreenCaptureProtection(
      !userSettings.screenCaptureProtection,
    );
  }, [userSettings]);

  const handleAppInformation = useCallback(() => {
    navigation.navigate('AppInformation');
  }, [navigation]);

  const handleLicences = useCallback(() => {
    navigation.navigate('Licences');
  }, [navigation]);

  const handleDeleteWallet = useCallback(() => {
    navigation.navigate('DeleteWallet');
  }, [navigation]);

  const handleClearCache = useCallback(() => {
    navigation.navigate('ClearCache');
  }, [navigation]);

  type SettingsListItem =
    | {
        buttonSetting: ButtonSettingProps;
      }
    | {
        switchSetting: SwitchSettingProps;
      };

  const handleWalletUnitRegistration = useCallback(() => {
    navigation.navigate('WalletUnitRegistrationInfo');
  }, [navigation]);

  const renderSettingsSectionHeader: SectionListProps<
    SettingsListItem,
    ListSectionHeaderProps
  >['renderSectionHeader'] = ({ section }) => {
    if (!section.title) {
      return null;
    }
    return <ListSectionHeader title={section.title} />;
  };

  const renderSettingsSectionFooter: SectionListProps<
    SettingsListItem,
    ListSectionHeaderProps
  >['renderSectionFooter'] = () => {
    return <View style={styles.sectionFooter} />;
  };

  const renderSettingsItem: SectionListProps<
    SettingsListItem,
    ListSectionHeaderProps
  >['renderItem'] = ({ item, index, section }) => {
    const style: StyleProp<ViewStyle> = [
      { backgroundColor: colorScheme.white },
      styles.item,
      index === 0 ? styles.sectionFirstItem : undefined,
      index === section.data.length - 1 ? styles.sectionLastItem : undefined,
    ];
    if ('buttonSetting' in item) {
      return <ButtonSetting style={style} {...item.buttonSetting} />;
    } else if ('switchSetting' in item) {
      return <SwitchSetting style={style} {...item.switchSetting} />;
    }
    return null;
  };

  const sections: SectionListProps<
    SettingsListItem,
    ListSectionHeaderProps
  >['sections'] = [
    {
      data: [
        config.featureFlags.localization
          ? {
              buttonSetting: {
                icon: LanguageIcon,
                onPress: handleChangeLanguage,
                testID: 'SettingsScreen.languageChange',
                title: translate('common.changeLanguage'),
              },
            }
          : undefined,
        {
          buttonSetting: {
            icon: HistoryIcon,
            onPress: handleHistory,
            testID: 'SettingsScreen.history',
            title: translate('common.history'),
          },
        },
      ].filter(nonEmptyFilter),
      title: translate('common.general'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: CreateBackupIcon,
            onPress: handleCreateBackup,
            testID: 'SettingsScreen.createBackup',
            title: translate('common.createBackup'),
          },
        },
        {
          buttonSetting: {
            icon: RestoreBackupIcon,
            onPress: handleRestoreBackup,
            testID: 'SettingsScreen.restoreBackup',
            title: translate('common.restoreBackup'),
          },
        },
      ],
      title: translate('common.backup&Recovery'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: PINIcon,
            onPress: handleChangePinCode,
            testID: 'SettingsScreen.changePIN',
            title: translate('common.changePinCode'),
          },
        },
        walletStore.isRSESetup
          ? {
              buttonSetting: {
                icon: PINIcon,
                onPress: handleChangeRSEPinCode,
                testID: 'SettingsScreen.changeRSEPIN',
                title: translate('info.settings.security.rse.pinCode'),
              },
            }
          : null,
        biometry
          ? {
              switchSetting: {
                disabled: biometricSetting.toggleUnavailable,
                icon: biometry === Biometry.FaceID ? FaceIDIcon : TouchIDIcon,
                onChange: biometricSetting.onPress,
                testID: 'SettingsScreen.biometry',
                title: translate('common.useBiometrics'),
                value: biometricSetting.toggleUnavailable
                  ? false
                  : userSettings.biometrics,
              },
            }
          : null,

        {
          switchSetting: {
            icon: ScreenCaptureProtectionIcon,
            onChange: handleScreenCaptureProtectionChange,
            testID: 'SettingsScreen.screenCaptureProtection',
            title: translate('info.settings.security.screenCaptureProtection'),
            value: userSettings.screenCaptureProtection,
          },
        },
        walletUnitAttestation.enabled
          ? {
              buttonSetting: {
                icon: WalletUnitAttestationIcon,
                onPress: handleWalletUnitRegistration,
                testID: 'SettingsScreen.walletUnitRegistration',
                title: translate('common.walletUnitRegistration'),
              },
            }
          : null,
      ].filter(nonEmptyFilter),
      title: translate('common.security'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: InformationIcon,
            onPress: handleAppInformation,
            testID: 'SettingsScreen.help',
            title: translate('common.information'),
          },
        },
        {
          buttonSetting: {
            icon: LicencesIcon,
            onPress: handleLicences,
            testID: 'SettingsScreen.licences',
            title: translate('common.licences&Agreements'),
          },
        },
      ],
      title: translate('common.help&Information'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: ClearCacheIcon,
            onPress: handleClearCache,
            testID: 'SettingsScreen.clearCache',
            title: translate('common.clearCache'),
          },
        },
        {
          buttonSetting: {
            icon: DeleteIcon,
            onPress: handleDeleteWallet,
            testID: 'SettingsScreen.deleteWallet',
            title: translate('common.deleteWallet'),
          },
        },
      ],
      title: translate('common.app'),
    },
  ];

  return (
    <SectionListScreen<SettingsListItem, ListSectionHeaderProps>
      header={{
        leftItem: <HeaderBackButton testID="SettingsScreen.header.back" />,
        title: translate('common.settings'),
      }}
      list={{
        ItemSeparatorComponent: SettingItemSeparator,
        renderItem: renderSettingsItem,
        renderSectionFooter: renderSettingsSectionFooter,
        renderSectionHeader: renderSettingsSectionHeader,
        sections,
        testID: 'SettingsScreen.content',
      }}
      testID="SettingsScreen"
    />
  );
});

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
  sectionFirstItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sectionFooter: {
    height: 24,
  },
  sectionLastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default DashboardScreen;
