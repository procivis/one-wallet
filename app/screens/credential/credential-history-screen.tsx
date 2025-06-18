import { HistoryListScreen } from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { translate } from '../../i18n';
import { historyListActionsFilter } from '../../models/core/history';
import {
  CredentialDetailNavigationProp,
  CredentialDetailRouteProp,
} from '../../navigators/credential-detail/credential-detail-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { historyListItemLabels } from '../../utils/history';

export const CredentialHistoryScreen: FC = () => {
  const rootNavigation =
    useNavigation<RootNavigationProp<'CredentialDetail'>>();
  const navigation = useNavigation<CredentialDetailNavigationProp<'History'>>();
  const route = useRoute<CredentialDetailRouteProp<'History'>>();

  const { credentialId } = route.params;

  const [searchPhrase, setSearchPhrase] = useState('');
  const query = useMemo(
    () => ({
      actions: historyListActionsFilter,
      credentialId,
      entityTypes: [
        HistoryEntityTypeEnum.CREDENTIAL,
        HistoryEntityTypeEnum.PROOF,
      ],
      searchText: searchPhrase,
    }),
    [credentialId, searchPhrase],
  );

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

  return (
    <HistoryListScreen
      labels={{
        emptySubtitle: translate('history.empty.subtitle'),
        emptyTitle: translate('history.empty.title'),
        list: {
          item: historyListItemLabels(),
          sectionHeader: {
            today: translate('common.today'),
            yesterday: translate('common.yesterday'),
          },
        },
        search: translate('common.search'),
        title: translate('history.title'),
      }}
      onBackPressed={navigation.goBack}
      onHistoryItemPressed={handleProofPress}
      onSearchPhraseChange={(searchPhrase) =>
        setSearchPhrase(searchPhrase ?? '')
      }
      queryParams={query}
      testID="CredentialHistoryScreen"
    />
  );
};
