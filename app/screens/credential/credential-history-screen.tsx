import {
  BackButton,
  NavigationHeader,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { FoldableSearchHeader } from '../../components/header/foldable-header';
import { HistorySectionList } from '../../components/history/history-list';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useListContentInset } from '../../hooks/list/list-content-inset';
import { translate } from '../../i18n';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';

export const CredentialHistoryScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'History'>>();
  const route = useRoute<CredentialDetailRouteProp<'History'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  const [searchPhrase, setSearchPhrase] = useState('');
  const query = useMemo(
    () => ({
      credentialId,
      entityTypes: [
        HistoryEntityTypeEnum.CREDENTIAL,
        HistoryEntityTypeEnum.PROOF,
      ],
      searchText: searchPhrase,
    }),
    [credentialId, searchPhrase],
  );

  const contentInset = useListContentInset({
    additionalBottomPadding: 24,
    headerHeight: 100,
  });

  const handleProofPress = useCallback(
    (entry: HistoryListItem) => {
      rootNavigation.navigate('Settings', {
        params: {
          params: { entry },
          screen: 'Detail',
        },
        screen: 'History',
      });
    },
    [rootNavigation],
  );

  const [scrollOffset] = useState(() => new Animated.Value(0));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorScheme.background,
        },
      ]}
      testID="CredentialHistoryScreen"
    >
      <HistorySectionList
        contentContainerStyle={contentInset}
        getItemProps={(item) =>
          item.entityType === HistoryEntityTypeEnum.PROOF ||
          item.entityType === HistoryEntityTypeEnum.CREDENTIAL
            ? { onPress: handleProofPress }
            : undefined
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
          {
            useNativeDriver: true,
          },
        )}
        query={query}
        testID="CredentialHistoryScreen.list"
      />
      <FoldableSearchHeader
        header={
          <NavigationHeader
            backgroundColor={'transparent'}
            leftItem={<BackButton onPress={navigation.goBack} />}
            title={credential?.schema.name}
          />
        }
        scrollOffset={scrollOffset}
        searchBar={{
          rightButtonAlwaysVisible: true,
          searchBarProps: {
            onSearchPhraseChange: setSearchPhrase,
            placeholder: translate('common.search'),
            searchPhrase,
            testID: 'CredentialHistoryScreen.search',
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
