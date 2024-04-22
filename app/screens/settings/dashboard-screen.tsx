import { useActionSheet } from '@expo/react-native-action-sheet';
import { useAppColorScheme } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { ComponentProps, FunctionComponent, useCallback } from 'react';
import {
  SectionListProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import {
  CreateBackupIcon,
  DeleteIcon,
  FaceIDIcon,
  HistoryIcon,
  InformationIcon,
  LanguageIcon,
  LicencesIcon,
  PINIcon,
  RestoreBackupIcon,
  TouchIDIcon,
} from '../../components/icon/settings-icon';
import ListSectionHeader, {
  ListSectionHeaderProps,
} from '../../components/list/list-section-header';
import { HeaderBackButton } from '../../components/navigation/header-buttons';
import SectionListScreen from '../../components/screens/section-list-screen';
import ButtonSetting from '../../components/settings/button-setting';
import SettingItemSeparator from '../../components/settings/setting-item-separator';
import SwitchSetting from '../../components/settings/switch-setting';
import { Biometry, useBiometricType } from '../../hooks/pin-code/biometric';
import { useExplicitPinCodeCheck } from '../../hooks/pin-code/pin-code-check';
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

  const handleLicences = useCallback(() => {
    navigation.navigate('Licences');
  }, [navigation]);

  const handleDeleteWallet = useCallback(() => {
    navigation.navigate('DeleteWallet');
  }, [navigation]);

  type SettingsListItem =
    | {
        buttonSetting: ComponentProps<typeof ButtonSetting>;
      }
    | {
        switchSetting: ComponentProps<typeof SwitchSetting>;
      };

  const renderSettingsSectionHeder: SectionListProps<
    SettingsListItem,
    ListSectionHeaderProps
  >['renderSectionHeader'] = ({ section }) => {
    if (!section.title) {
      return null;
    }
    return <ListSectionHeader title={section.title} />;
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
        {
          buttonSetting: {
            icon: LanguageIcon,
            onPress: handleChangeLanguage,
            testID: 'SettingsScreen.languageChange',
            title: translate('settings.general.language'),
          },
        },
        {
          buttonSetting: {
            icon: HistoryIcon,
            onPress: handleHistory,
            testID: 'SettingsScreen.history',
            title: translate('settings.general.history'),
          },
        },
      ],
      title: translate('settings.general.title'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: CreateBackupIcon,
            onPress: handleCreateBackup,
            testID: 'SettingsScreen.createBackup',
            title: translate('settings.backup.createBackup'),
          },
        },
        {
          buttonSetting: {
            icon: RestoreBackupIcon,
            onPress: handleRestoreBackup,
            testID: 'SettingsScreen.restoreBackup',
            title: translate('settings.backup.restoreBackup'),
          },
        },
      ],
      title: translate('settings.backup.title'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: PINIcon,
            onPress: handleChangePinCode,
            testID: 'SettingsScreen.changePIN',
            title: translate('settings.security.pinCode'),
          },
        },
        biometry
          ? {
              switchSetting: {
                icon: biometry === Biometry.FaceID ? FaceIDIcon : TouchIDIcon,
                onChange: handleBiometrics,
                title: translate('settings.security.biometrics'),
                value: userSettings.biometrics,
              },
            }
          : null,
      ].filter(nonEmptyFilter),
      title: translate('settings.security.title'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: InformationIcon,
            onPress: handleAppInformation,
            testID: 'SettingsScreen.help',
            title: translate('settings.help.information'),
          },
        },
        {
          buttonSetting: {
            icon: LicencesIcon,
            onPress: handleLicences,
            testID: 'SettingsScreen.licences',
            title: translate('settings.help.licences'),
          },
        },
      ],
      title: translate('settings.help.title'),
    },
    {
      data: [
        {
          buttonSetting: {
            icon: DeleteIcon,
            onPress: handleDeleteWallet,
            testID: 'SettingsScreen.deleteWallet',
            title: translate('settings.profile.deleteWallet'),
          },
        },
      ],
      title: translate('settings.app.title'),
    },
  ];

  return (
    <SectionListScreen<SettingsListItem, ListSectionHeaderProps>
      header={{
        leftItem: HeaderBackButton,
        title: translate('settings.title'),
      }}
      list={{
        ItemSeparatorComponent: SettingItemSeparator,
        renderItem: renderSettingsItem,
        renderSectionHeader: renderSettingsSectionHeder,
        sections: sections,
      }}
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
  sectionLastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default DashboardScreen;
