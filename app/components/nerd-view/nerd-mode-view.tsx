import {
  CloseIcon,
  EntityCluster,
  NavigationHeader,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NerdModeItem, { NerdModeItemProps } from './nerd-mode-item';

const styles = StyleSheet.create({
  entityCluster: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionHeaderContainer: {
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 16,
  },
  sectionHeaderText: {
    opacity: 0.7,
    paddingHorizontal: 20,
  },
});

type NerdModeProps = {
  entityCluster?: {
    entityName: string;
  };
  onClose: () => void;
  sections: {
    data: Array<NerdModeItemProps>;
    title: string;
  }[];
  title: string;
};

const NerdMode: FunctionComponent<NerdModeProps> = ({
  sections,
  onClose,
  entityCluster,
  title,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();

  const lastElements = sections.reduce((acc, { title: sectionTitle, data }) => {
    const lastElement = data[data.length - 1];
    return { ...acc, [sectionTitle]: lastElement.attributeKey };
  }, {} as Record<string, string>);

  return (
    <>
      <NavigationHeader
        leftItem={<CloseIcon color={colorScheme.white} onPress={onClose} />}
        style={{
          backgroundColor: colorScheme.nerdView.background,
          paddingTop: insets.top,
        }}
        title={title}
        titleColor={colorScheme.white}
      />
      <SectionList
        ListHeaderComponent={
          entityCluster ? (
            <EntityCluster
              entityName={entityCluster?.entityName}
              style={[
                styles.entityCluster,
                {
                  backgroundColor: colorScheme.nerdView.background,
                },
              ]}
              textColor={colorScheme.white}
            />
          ) : null
        }
        renderItem={({ item, section }) => (
          <NerdModeItem
            {...item}
            last={lastElements[section.title] === item.attributeKey}
          />
        )}
        renderSectionHeader={({ section }) => {
          return (
            <View style={styles.sectionHeaderContainer}>
              <Typography
                color={colorScheme.white}
                style={styles.sectionHeaderText}
              >
                {section.title}
              </Typography>
            </View>
          );
        }}
        sections={sections}
        stickySectionHeadersEnabled={false}
        style={{ backgroundColor: colorScheme.nerdView.background }}
      />
    </>
  );
};

export const NerdModeView = NerdMode;
