import {
  BackButton,
  CredentialDetails,
  DataItem,
  EntityDetails,
  formatDateTimeLocalized,
  HistoryStatusIcon,
  HistoryStatusIconType,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
  useCredentialDetail,
  useCredentialListExpandedCard,
  useProofDetail,
} from '@procivis/one-react-native-components';
import {
  Claim,
  ClaimValue,
  DataTypeEnum,
  HistoryActionEnum,
  HistoryEntityTypeEnum,
  ProofInputClaim,
  TrustEntityRoleEnum,
  UnexportableEntities,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import { omit } from 'lodash';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { PreviewCredentials } from '../../components/backup/preview-credentials';
import { HeaderInfoButton } from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  HistoryNavigationProp,
  HistoryRouteProp,
} from '../../navigators/history/history-routes';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';
import { nonEmptyFilter } from '../../utils/filtering';
import { getEntryTitle } from '../../utils/history';
import { capitalizeFirstLetter } from '../../utils/string';
import { trustEntityDetailsLabels } from '../../utils/trust-entity';

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

const claimFromProofInputClaim = (
  input: ProofInputClaim,
): Claim | undefined => {
  const value = claimValueFromProofInputClaim(input);
  if (!value) {
    return undefined;
  }
  return {
    ...value,
    id: input.schema.id,
    key: input.schema.key,
  };
};

const claimValueFromProofInputClaim = ({
  schema,
  value,
}: ProofInputClaim): ClaimValue | undefined => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const values = value.map(claimFromProofInputClaim).filter(nonEmptyFilter);
    return schema.dataType === (DataTypeEnum.Object as string)
      ? {
          array: schema.array,
          dataType: DataTypeEnum.Object,
          value: values,
        }
      : {
          array: true,
          dataType: schema.dataType,
          value: values,
        };
  }

  return {
    array: false,
    dataType: schema.dataType,
    value,
  };
};

export const HistoryDetailScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<HistoryNavigationProp<'Detail'>>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const onImagePreview = useCredentialImagePreview();

  const route = useRoute<HistoryRouteProp<'Detail'>>();
  const { entry } = route.params;
  const { metadata } = entry;
  const backupInfo: UnexportableEntities | undefined =
    metadata && 'credentials' in metadata ? metadata : undefined;
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
    .map(({ claims, credential }) => {
      if (!credential) {
        return undefined;
      }
      return {
        ...credential,
        claims: claims.map(claimFromProofInputClaim).filter(nonEmptyFilter),
      };
    })
    .filter(nonEmptyFilter);

  const { expandedCredential, onHeaderPress } = useCredentialListExpandedCard();

  // by default the first credential is expanded
  const initialExpansionPerformed = useRef(false);
  useEffect(() => {
    const credential = issuedCredential ?? proofCredentials?.[0];
    if (
      !expandedCredential &&
      credential &&
      !initialExpansionPerformed.current
    ) {
      initialExpansionPerformed.current = true;
      onHeaderPress(credential.id);
    }
  }, [expandedCredential, issuedCredential, proofCredentials, onHeaderPress]);

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

    return (
      <HeaderInfoButton
        onPress={infoPressHandler}
        testID="HistoryDetailScreen.header.info"
      />
    );
  }, [entry, rootNavigation]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <BackButton
            onPress={navigation.goBack}
            testID="HistoryDetailScreen.header.back"
          />
        ),
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
        {issuedCredential?.issuerDid && (
          <EntityDetails
            did={issuedCredential.issuerDid}
            labels={trustEntityDetailsLabels(TrustEntityRoleEnum.ISSUER)}
            role={TrustEntityRoleEnum.ISSUER}
            style={[styles.entity, { borderColor: colorScheme.grayDark }]}
          />
        )}
        {proof?.verifierDid && (
          <EntityDetails
            did={proof.verifierDid}
            labels={trustEntityDetailsLabels(TrustEntityRoleEnum.VERIFIER)}
            role={TrustEntityRoleEnum.VERIFIER}
            style={[styles.entity, { borderColor: colorScheme.grayDark }]}
            testID="EntityDetail"
          />
        )}
        <DataItem
          attribute={translate('historyDetail.date')}
          value={formatDateTimeLocalized(new Date(entry.createdDate)) ?? ''}
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
          <PreviewCredentials
            credentials={backupInfo.credentials.map((credential) => {
              return {
                issuerDid: credential.issuerDid?.did,
                ...omit(credential, 'issuerDid'),
              };
            })}
          />
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
          <CredentialDetails
            credentialId={issuedCredential.id}
            expanded={expandedCredential === issuedCredential.id}
            labels={credentialCardLabels()}
            lastItem
            onHeaderPress={onHeaderPress}
            onImagePreview={onImagePreview}
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
              <CredentialDetails
                claims={proofCredential.claims}
                credentialId={proofCredential.id}
                expanded={expandedCredential === proofCredential.id}
                labels={credentialCardLabels()}
                lastItem={index === length - 1}
                onHeaderPress={onHeaderPress}
                onImagePreview={onImagePreview}
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
