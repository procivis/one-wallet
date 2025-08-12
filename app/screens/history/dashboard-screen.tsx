import { HistoryListScreen } from '@procivis/one-react-native-components';
import {
  HistoryEntityTypeEnum,
  HistoryListItem,
  HistoryListQuery,
} from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';

import { CredentialSchemaPicker } from '../../components/history/credential-schema-picker';
import { translate } from '../../i18n';
import { historyListActionsFilter } from '../../models/core/history';
import { HistoryNavigationProp } from '../../navigators/history/history-routes';
import { historyListItemLabels } from '../../utils/history';

const HistoryDashboardScreen: FC = () => {
  const navigation = useNavigation<HistoryNavigationProp<'HistoryDashboard'>>();
  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<Partial<HistoryListQuery>>({
    actions: historyListActionsFilter,
    entityTypes: [
      HistoryEntityTypeEnum.BACKUP,
      HistoryEntityTypeEnum.CREDENTIAL,
      HistoryEntityTypeEnum.PROOF,
    ],
  });

  const handleItemPress = useCallback(
    (entry: HistoryListItem) => {
      navigation.navigate('Detail', { entry });
    },
    [navigation],
  );

  const handleCredentialSchemaChange = useCallback(
    (credentialSchemaId?: string) => {
      setQueryParams((prev) => ({ ...prev, credentialSchemaId }));
    },
    [],
  );

  const handleSearchPhraseChange = useCallback(
    (newSearchPhrase: string | undefined) =>
      setQueryParams((prev) => ({
        ...prev,
        search: newSearchPhrase ? { text: newSearchPhrase } : undefined,
      })),
    [],
  );

  return (
    <HistoryListScreen
      labels={{
        emptySubtitle: translate('info.history.empty.subtitle'),
        emptyTitle: translate('common.noEntries'),
        list: {
          item: historyListItemLabels(),
          sectionHeader: {
            today: translate('common.today'),
            yesterday: translate('common.yesterday'),
          },
        },
        search: translate('common.search'),
        title: translate('common.history'),
      }}
      onBackPressed={navigation.goBack}
      onHistoryItemPressed={handleItemPress}
      onOpenFilter={() => setIsFilterModalOpened(true)}
      onSearchPhraseChange={handleSearchPhraseChange}
      queryParams={queryParams}
    >
      <CredentialSchemaPicker
        onClose={() => setIsFilterModalOpened(false)}
        onSelection={handleCredentialSchemaChange}
        selected={queryParams.credentialSchemaId}
        visible={isFilterModalOpened}
      />
    </HistoryListScreen>
  );
};

export default HistoryDashboardScreen;
