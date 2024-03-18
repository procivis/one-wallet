import {
  DetailScreen as DetailScreenComponent,
  useAppColorScheme,
} from '@procivis/react-native-components';
import {
  HistoryActionEnum,
  HistoryEntityTypeEnum,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { DataItem } from '../../components/common/data-item';
import { Section } from '../../components/common/section';
import { Credential } from '../../components/credential/credential';
import { useCredentialDetail } from '../../hooks/credentials';
import { useProofDetail } from '../../hooks/proofs';
import { translate, TxKeyPath } from '../../i18n';
import {
  HistoryNavigationProp,
  HistoryRouteProp,
} from '../../navigators/history/history-routes';
import { formatTimestamp } from '../../utils/date';
import { getEntryTitle } from '../../utils/history';
import {
  capitalizeFirstLetter,
  replaceBreakingHyphens,
} from '../../utils/string';

const DetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<HistoryNavigationProp<'Detail'>>();
  const route = useRoute<HistoryRouteProp<'Detail'>>();
  const { entry } = route.params;
  const { metadata: backupInfo } = entry;
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
  const destructiveActions = [
    HistoryActionEnum.DEACTIVATED,
    HistoryActionEnum.DELETED,
    HistoryActionEnum.REJECTED,
    HistoryActionEnum.REVOKED,
  ];
  const actionValueColor = destructiveActions.includes(entry.action)
    ? colorScheme.alertText
    : colorScheme.text;

  return (
    <DetailScreenComponent
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
          valueColor={actionValueColor}
        />
      </Section>

      {backupInfo && (
        <PreviewCredentials
          credentials={backupInfo.credentials}
          title={translate('historyDetail.backedUp')}
        />
      )}

      {credential && (
        <Section title={translate('historyDetail.credential')}>
          <Credential credentialId={credential.id} expanded />
        </Section>
      )}

      {proof && (
        <Section title={translate('historyDetail.credential')}>
          {proof.credentials.map((proofCredential, index) => (
            <View
              key={proofCredential.id}
              style={[styles.credential, index === 0 && styles.credentialFirst]}
            >
              <Credential credentialId={proofCredential.id} expanded />
            </View>
          ))}
        </Section>
      )}
    </DetailScreenComponent>
  );
};

const styles = StyleSheet.create({
  credential: {
    marginTop: 12,
  },
  credentialFirst: {
    marginTop: 0,
  },
  entityTitle: {
    marginBottom: 0,
  },
});

export default DetailScreen;
