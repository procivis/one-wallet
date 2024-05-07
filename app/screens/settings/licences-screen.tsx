import {
  LinkIcon,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import {
  Linking,
  Platform,
  SectionListProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import ListSectionHeader, {
  ListSectionHeaderProps,
} from '../../components/list/list-section-header';
import { HeaderBackButton } from '../../components/navigation/header-buttons';
import SectionListScreen from '../../components/screens/section-list-screen';
import ButtonSetting from '../../components/settings/button-setting';
import { config } from '../../config';
import { useUpdatedTranslate } from '../../hooks/updated-translate';
import { LibrariesLicences } from '../../models/licences/licences';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { reportException } from '../../utils/reporting';

type LicencesListItem =
  | {
      link: {
        title: string;
        url: string;
      };
    }
  | {
      library: string;
    };

const LicencesScreen: FC = () => {
  const navigation = useNavigation<SettingsNavigationProp<'Licences'>>();
  const colorScheme = useAppColorScheme();
  const translate = useUpdatedTranslate();

  const libraries: LibrariesLicences =
    Platform.OS === 'ios'
      ? require('../../../assets/licences/licences.ios.json')
      : require('../../../assets/licences/licences.android.json');

  const openURL = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      reportException(err, `Failed to open user agreement URL: ${url}`),
    );
  }, []);

  const openLicenceDetails = useCallback(
    (name: string) => {
      const library = libraries.components.find((l) => l.name === name);
      if (!library) {
        return;
      }
      const licences = libraries.licences.filter((l) =>
        library.licenses.includes(l.id),
      );
      navigation.navigate('LicenceDetails', { library, licences });
    },
    [libraries, navigation],
  );

  const renderSettingsSectionHeder: SectionListProps<
    LicencesListItem,
    ListSectionHeaderProps
  >['renderSectionHeader'] = ({ section }) => {
    if (!section.title) {
      return null;
    }
    return <ListSectionHeader title={section.title} />;
  };

  const renderSettingsItem: SectionListProps<
    LicencesListItem,
    ListSectionHeaderProps
  >['renderItem'] = ({ item }) => {
    const style: StyleProp<ViewStyle> = [
      styles.item,
      { backgroundColor: colorScheme.background },
    ];
    if ('link' in item) {
      return (
        <ButtonSetting
          accessory={<LinkIcon color={colorScheme.text} />}
          onPress={() => openURL(item.link.url)}
          style={style}
          title={item.link.title}
        />
      );
    } else if ('library' in item) {
      return (
        <ButtonSetting
          onPress={() => openLicenceDetails(item.library)}
          style={style}
          title={item.library}
        />
      );
    }
    return null;
  };

  const sections: SectionListProps<
    LicencesListItem,
    ListSectionHeaderProps
  >['sections'] = [
    {
      data: [
        {
          link: {
            title: translate('onboarding.userAgreement.termsOfService.label'),
            url: translate('onboarding.userAgreement.termsOfService.link'),
          },
        },
        {
          link: {
            title: translate('onboarding.userAgreement.privacyPolicy.label'),
            url: translate('onboarding.userAgreement.privacyPolicy.link'),
          },
        },
      ],
      title: config.appName,
    },
    {
      data: libraries.components.map((library) => ({
        library: library.name,
      })),
      title: translate('licencesScreen.libraries'),
    },
  ];

  return (
    <SectionListScreen<LicencesListItem, ListSectionHeaderProps>
      header={{
        leftItem: HeaderBackButton,
        title: translate('licencesScreen.title'),
      }}
      list={{
        contentContainerStyle: styles.content,
        renderItem: renderSettingsItem,
        renderSectionHeader: renderSettingsSectionHeder,
        sections: sections,
        testID: 'LicencesScreen.content',
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID="LicencesScreen"
    />
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  item: {
    borderRadius: 12,
    height: 68,
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
});

export default LicencesScreen;
