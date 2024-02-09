import {
  DetailScreen,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { HistoryEntityTypeEnum } from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { DataItem } from '../../components/common/data-item';
import { Section } from '../../components/common/section';
import Credential from '../../components/history/Credential';
import { useCredentialDetail } from '../../hooks/credentials';
import { useProofDetail } from '../../hooks/proofs';
import { translate, TxKeyPath } from '../../i18n';
import {
  SettingsNavigationProp,
  SettingsRouteProp,
} from '../../navigators/settings/settings-routes';
import { formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';
import {
  capitalizeFirstLetter,
  replaceBreakingHyphens,
} from '../../utils/string';

const HistoryDetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'HistoryDetail'>>();
  const route = useRoute<SettingsRouteProp<'HistoryDetail'>>();
  const { entry } = route.params;
  const { data: credential } = useCredentialDetail(
    entry.entityType === HistoryEntityTypeEnum.CREDENTIAL
      ? entry.entityId
      : undefined,
  );
  const { data: proof } = useProofDetail(
    entry.entityType === HistoryEntityTypeEnum.PROOF
      ? entry.entityId
      : undefined,
  );

  const from = credential?.issuerDid ?? proof?.verifierDid;
  return (
    <DetailScreen
      onBack={navigation.goBack}
      style={{ backgroundColor: colorScheme.background }}
      testID="HistoryDetailScreen"
      title={getEntryTitle(entry)}
    >
      <Section
        title={translate('historyDetail.entity')}
        titleStyle={styles.entityTitle}
      >
        {from && (
          <DataItem
            attribute={translate('historyDetail.from')}
            multiline={true}
            value={replaceBreakingHyphens(from)}
          />
        )}

        <DataItem
          attribute={translate('historyDetail.type')}
          value={translate(
            `history.entityType.${entry.entityType}` as TxKeyPath,
          )}
        />

        <DataItem
          attribute={translate('historyDetail.date')}
          value={formatTimestamp(new Date(entry.createdDate))}
        />

        <DataItem
          attribute={translate('historyDetail.action')}
          value={capitalizeFirstLetter(
            translate(`history.action.${entry.action}` as TxKeyPath),
          )}
        />
      </Section>

      {credential && (
        <Section title={translate('historyDetail.credential')}>
          <Credential credential={credential} />
        </Section>
      )}

      {proof && (
        <Section title={translate('historyDetail.credential')}>
          {proof.credentials.map((proofCredential, index, { length }) => (
            <View
              key={proofCredential.id}
              style={[
                styles.credential,
                length === index + 1 && styles.credentialLast,
              ]}
            >
              <Credential credential={proofCredential} />
            </View>
          ))}
        </Section>
      )}
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginBottom: 12,
  },
  credentialLast: {
    marginBottom: 0,
  },
  entityTitle: {
    marginBottom: 0,
  },
});

export default HistoryDetailScreen;
