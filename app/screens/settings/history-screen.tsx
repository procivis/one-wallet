import {
  DetailScreen,
  ListItemProps,
  ListView,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { NextIcon } from '../../components/icon/common-icon';
import { useHistory } from '../../hooks/history';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { formatMonth, formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';

const HistoryScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'History'>>();
  const { data: history, isLoading } = useHistory();

  const handleItemPress = useCallback(
    (entryGroupIndex: number) => (_: ListItemProps, index: number) => {
      navigation.navigate('HistoryDetail', {
        entry: history![entryGroupIndex].entries[index],
      });
    },
    [history, navigation],
  );

  if (isLoading || !history) {
    return <ActivityIndicator />;
  }

  return (
    <DetailScreen
      onBack={navigation.goBack}
      style={{ backgroundColor: colorScheme.background }}
      testID="HistoryScreen"
      title={translate('history.title')}
    >
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Typography
            align="center"
            bold
            color={colorScheme.textSecondary}
            size="sml"
            style={styles.emptyTitle}
          >
            {translate('history.empty.title')}
          </Typography>
          <Typography
            align="center"
            color={colorScheme.textSecondary}
            size="sml"
          >
            {translate('history.empty.subtitle')}
          </Typography>
        </View>
      ) : (
        history.map((entryGroup, entryGroupIndex) => (
          <ListView
            emptyListSubtitle={translate('history.empty.subtitle')}
            emptyListTitle={translate('history.empty.title')}
            items={entryGroup.entries.map((entry) => {
              return {
                rightAccessory: <NextIcon color={colorScheme.text} />,
                style: styles.entry,
                subtitle: `${formatTimestamp(new Date(entry.createdDate))} - ${
                  entry.entityId
                }`,
                title: getEntryTitle(entry),
              };
            })}
            key={entryGroup.date}
            onItemSelected={handleItemPress(entryGroupIndex)}
            style={styles.entryList}
            title={formatMonth(new Date(entryGroup.date))}
            titleStyle={styles.entryListTitle}
          />
        ))
      )}
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 24,
  },
  emptyTitle: {
    marginBottom: 2,
  },
  entry: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  // eslint-disable-next-line react-native/no-color-literals
  entryList: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  entryListTitle: {
    marginBottom: 18,
    marginTop: -12,
  },
});

export default HistoryScreen;
