import {
  ButtonSetting,
  LinkIcon,
  ListSectionHeader,
  ListSectionHeaderProps,
  SectionListScreen,
  SettingItemSeparator,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import {
  Linking,
  SectionListProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { HeaderBackButton } from '../../components/navigation/header-buttons';
import { useUpdatedTranslate } from '../../hooks/updated-translate';
import { SettingsRouteProp } from '../../navigators/settings/settings-routes';
import { nonEmptyFilter } from '../../utils/filtering';

type LicenceDetailsListItem =
  | {
      description: string;
    }
  | {
      link: {
        title: string;
        url: string;
      };
    }
  | {
      licence: string;
    };

const ItemSeparatorComponent = () => (
  <SettingItemSeparator style={styles.separator} />
);

const LicenceDetailsScreen: FC = () => {
  const route = useRoute<SettingsRouteProp<'LicenceDetails'>>();
  const colorScheme = useAppColorScheme();
  const translate = useUpdatedTranslate();
  const { library, licences } = route.params;

  const openURL = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const renderSettingsSectionHeder: SectionListProps<
    LicenceDetailsListItem,
    Partial<ListSectionHeaderProps>
  >['renderSectionHeader'] = ({ section }) => {
    if (!section.title) {
      return null;
    }
    return (
      <ListSectionHeader
        preset="m"
        style={styles.sectionHeader}
        title={section.title}
      />
    );
  };

  const renderSettingsItem: SectionListProps<
    LicenceDetailsListItem,
    Partial<ListSectionHeaderProps>
  >['renderItem'] = ({ item }) => {
    const style: StyleProp<ViewStyle> = [
      styles.item,
      { backgroundColor: colorScheme.background },
    ];
    if ('description' in item) {
      return (
        <Typography
          color={colorScheme.text}
          style={[styles.text, styles.description]}
        >
          {item.description}
        </Typography>
      );
    } else if ('link' in item) {
      return (
        <ButtonSetting
          accessory={<LinkIcon color={colorScheme.text} />}
          onPress={() => openURL(item.link.url)}
          style={style}
          title={item.link.title}
        />
      );
    } else if ('licence' in item) {
      return (
        <Typography color={colorScheme.text} style={styles.text}>
          {item.licence}
        </Typography>
      );
    }
    return null;
  };

  const links =
    library.externalReferences
      ?.filter(({ type }) => type !== 'other')
      .map(({ type, url }) => ({
        link: {
          title: translate(
            `licenceDetailsScreen.library.link.${
              type as 'documentation' | 'website' | 'vcs'
            }`,
          ),
          url,
        },
      })) ?? [];

  links.push(
    ...licences.flatMap((l) =>
      l.seeAlso.map((url) => ({
        link: {
          title: url,
          url,
        },
      })),
    ),
  );

  const sections: SectionListProps<
    LicenceDetailsListItem,
    Partial<ListSectionHeaderProps>
  >['sections'] = [
    {
      data: [
        library.description
          ? {
              description: library.description,
            }
          : undefined,
        ...links,
      ].filter(nonEmptyFilter),
    },
    {
      ItemSeparatorComponent,
      data: licences.map((l) => ({
        licence: l.licenseText,
      })),
      title: translate(
        `licenceDetailsScreen.${licences.length > 1 ? 'licences' : 'licence'}`,
      ),
    },
  ];

  return (
    <SectionListScreen<LicenceDetailsListItem, Partial<ListSectionHeaderProps>>
      header={{
        backgroundColor: colorScheme.white,
        leftItem: HeaderBackButton,
        static: true,
        title: library.name,
      }}
      list={{
        contentContainerStyle: styles.content,
        renderItem: renderSettingsItem,
        renderSectionHeader: renderSettingsSectionHeder,
        sections: sections,
      }}
      style={{ backgroundColor: colorScheme.white }}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  description: {
    marginBottom: 24,
  },
  item: {
    borderRadius: 12,
    height: 68,
    marginHorizontal: 16,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    marginBottom: 40,
    marginTop: 64,
  },
  separator: {
    marginTop: 24,
    paddingHorizontal: 0,
  },
  text: {
    marginHorizontal: 16,
    opacity: 0.7,
  },
});

export default LicenceDetailsScreen;
