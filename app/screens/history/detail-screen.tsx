import {
  BackButton,
  DataItem,
  EntityCluster,
  formatDateTime,
  HistoryStatusIcon,
  HistoryStatusIconType,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  HistoryActionEnum,
  HistoryEntityTypeEnum,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { Credential } from '../../components/credential/credential';
import { HeaderInfoButton } from '../../components/navigation/header-buttons';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useProofDetail } from '../../hooks/core/proofs';
import { useCredentialListExpandedCard } from '../../hooks/credential-card/credential-card-expanding';
import { translate } from '../../i18n';
import {
  HistoryNavigationProp,
  HistoryRouteProp,
} from '../../navigators/history/history-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { nonEmptyFilter } from '../../utils/filtering';
import { getEntryTitle } from '../../utils/history';
import {
  capitalizeFirstLetter,
  replaceBreakingHyphens,
} from '../../utils/string';

const getActionStatus = (action: HistoryActionEnum) => {
  switch (action) {
    case HistoryActionEnum.DEACTIVATED:
    case HistoryActionEnum.DELETED:
    case HistoryActionEnum.REJECTED:
    case HistoryActionEnum.REVOKED:
      return HistoryStatusIconType.Error;
    case HistoryActionEnum.ERRORED:
      return HistoryStatusIconType.Error;
    case HistoryActionEnum.SUSPENDED:
      return HistoryStatusIconType.Suspend;
    case HistoryActionEnum.OFFERED:
    case HistoryActionEnum.PENDING:
    case HistoryActionEnum.REQUESTED:
      return HistoryStatusIconType.Indicator;
    default:
      return HistoryStatusIconType.Success;
  }
};

const getStatusTextColor = (status: HistoryStatusIconType) => {
  switch (status) {
    case HistoryStatusIconType.Success:
      return '#006B34';
    case HistoryStatusIconType.Error:
      return '#A73535';
    default:
      return undefined;
  }
};

export const HistoryDetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<HistoryNavigationProp<'Detail'>>();
  const rootNavigation = useNavigation<RootNavigationProp>();

  const route = useRoute<HistoryRouteProp<'Detail'>>();
  const { entry } = route.params;
  const { metadata: backupInfo } = entry;
  const { data: issuedCredential } = useCredentialDetail(
    entry.entityType === HistoryEntityTypeEnum.CREDENTIAL
      ? entry.entityId
      : undefined,
  );
  const { data: proof } = useProofDetail(
    entry.entityType === HistoryEntityTypeEnum.PROOF
      ? entry.entityId
      : undefined,
  );
  const proofCredentials = (proof?.proofInputs ?? [])
    .map(({ credential }) => credential)
    .filter(nonEmptyFilter);

  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();

  const from = issuedCredential?.issuerDid ?? proof?.verifierDid;
  const entityName = from
    ? replaceBreakingHyphens(from)
    : issuedCredential
    ? translate('credentialOffer.unknownIssuer')
    : translate('proofRequest.unknownVerifier');
  const actionStatus = getActionStatus(entry.action);
  const actionValueColor = getStatusTextColor(actionStatus);

  const moreInfoIcon = useMemo(() => {
    if (entry.entityType === HistoryEntityTypeEnum.BACKUP) {
      return undefined;
    }

    const infoPressHandler = () => {
      if (entry.entityType === HistoryEntityTypeEnum.PROOF) {
        rootNavigation.navigate('NerdMode', {
          params: {
            proofId: entry.entityId!,
          },
          screen: 'ProofNerdMode',
        });
      } else if (entry.entityType === HistoryEntityTypeEnum.CREDENTIAL) {
        const credentialActions = [
          HistoryActionEnum.REACTIVATED,
          HistoryActionEnum.SUSPENDED,
          HistoryActionEnum.REVOKED,
          HistoryActionEnum.DEACTIVATED,
        ];
        if (credentialActions.includes(entry.action)) {
          rootNavigation.navigate('NerdMode', {
            params: {
              credentialId: entry.entityId!,
            },
            screen: 'CredentialNerdMode',
          });
        } else {
          rootNavigation.navigate('NerdMode', {
            params: {
              credentialId: entry.entityId!,
            },
            screen: 'OfferNerdMode',
          });
        }
      }
    };

    return <HeaderInfoButton onPress={infoPressHandler} />;
  }, [entry, rootNavigation]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: <BackButton onPress={navigation.goBack} />,
        rightItem: moreInfoIcon,
        static: true,
        title: getEntryTitle(entry),
      }}
      scrollView={{
        style: styles.content,
      }}
      testID="HistoryDetailScreen"
    >
      <View style={[styles.section, { backgroundColor: colorScheme.white }]}>
        {from && (
          <EntityCluster
            entityName={entityName}
            style={[styles.entity, { borderColor: colorScheme.background }]}
          />
        )}
        <DataItem
          attribute={translate('historyDetail.date')}
          value={formatDateTime(new Date(entry.createdDate)) ?? ''}
        />
        <DataItem
          attribute={translate('historyDetail.type')}
          value={translate(`history.entityType.${entry.entityType}`)}
        />
        <DataItem
          attribute={translate('historyDetail.action')}
          last
          value={capitalizeFirstLetter(
            translate(`history.action.${entry.action}`),
          )}
          valueColor={actionValueColor}
          valueIcon={<HistoryStatusIcon type={actionStatus} />}
        />
      </View>

      {backupInfo?.credentials.length ? (
        <>
          <Typography
            color={colorScheme.text}
            preset="m"
            style={styles.sectionHeader}
          >
            {translate('createBackup.preview.notBackedUp')}
          </Typography>
          <PreviewCredentials credentials={backupInfo.credentials} />
        </>
      ) : null}

      {issuedCredential && (
        <>
          <Typography
            color={colorScheme.text}
            preset="m"
            style={styles.sectionHeader}
          >
            {translate('historyDetail.credential')}
          </Typography>
          <Credential
            credentialId={issuedCredential.id}
            expanded={expandedCredential === issuedCredential.id}
            lastItem
            onHeaderPress={onHeaderPress}
          />
        </>
      )}

      {proof && (
        <>
          <Typography
            color={colorScheme.text}
            preset="m"
            style={styles.sectionHeader}
          >
            {translate('historyDetail.response')}
          </Typography>
          {proofCredentials.map((proofCredential, index, { length }) => (
            <View key={proofCredential.id} style={styles.credential}>
              <Credential
                credentialId={proofCredential.id}
                expanded={expandedCredential === proofCredential.id}
                lastItem={index === length - 1}
                onHeaderPress={onHeaderPress}
              />
            </View>
          ))}
        </>
      )}
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  credential: {
    marginBottom: 4,
  },
  entity: {
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  section: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  sectionHeader: {
    marginHorizontal: 4,
    marginVertical: 16,
  },
});
