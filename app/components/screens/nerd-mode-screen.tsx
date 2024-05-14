import {
  CloseIcon,
  concatTestID,
  ContrastingStatusBar,
  EntityCluster,
  NavigationHeader,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FunctionComponent } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NerdModeItem, {
  NerdModeItemProps,
} from '../../components/nerd-view/nerd-mode-item';

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

export type NerdModeSection = {
  data: Array<NerdModeItemProps>;
  title: string;
};

type NerdModeProps = {
  entityCluster?: {
    entityName: string;
  };
  onClose: () => void;
  sections: NerdModeSection[];
  testID: string;
  title: string;
};

const NerdModeScreen: FunctionComponent<NerdModeProps> = ({
  sections,
  onClose,
  entityCluster,
  testID,
  title,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();

  const lastElementsForSection = sections.reduce(
    (acc, { title: sectionTitle, data }) => {
      const lastElement = data[data.length - 1];
      return { ...acc, [sectionTitle]: lastElement.attributeKey };
    },
    {} as Record<string, string>,
  );

  return (
    <>
      <ContrastingStatusBar backgroundColor={colorScheme.nerdView.background} />
      <NavigationHeader
        leftItem={
          <TouchableOpacity
            onPress={onClose}
            testID={concatTestID(testID, 'closeIcon')}
          >
            <CloseIcon color={colorScheme.white} />
          </TouchableOpacity>
        }
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
              testID={concatTestID(testID, 'entityCluster')}
              textColor={colorScheme.white}
            />
          ) : null
        }
        renderItem={({ item, section }) => (
          <NerdModeItem
            {...item}
            last={lastElementsForSection[section.title] === item.attributeKey}
            testID={concatTestID(testID, item.testID)}
          />
        )}
        renderSectionHeader={({ section }) => {
          return (
            <View
              style={styles.sectionHeaderContainer}
              testID={concatTestID(testID, section.title)}
            >
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
        testID={testID}
      />
    </>
  );
};

export default NerdModeScreen;
