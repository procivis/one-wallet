import {
  concatTestID,
  ProofRequestSet,
  ScrollViewScreen,
  ShareCredentialV2Group,
  useAppColorScheme,
  useTransactionData,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import {
  HeaderBackButton,
  HeaderInfoButton,
} from '../../components/navigation/header-buttons';
import PaymentTransactionDetails from '../../components/proof-request/payment-transaction-details';
import TransactionDataItem from '../../components/proof-request/transaction-data-item';
import TransactionHeader from '../../components/proof-request/transaction-header';
import {
  DEFAULT_TRANSACTION_HEADER,
  TRANSACTION_HEADER_CONFIG,
} from '../../components/proof-request/transaction-request-list-item';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { useCurrentLanguage } from '../../hooks/language';
import { translate } from '../../i18n';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import {
  ShareCredentialNavigationProp,
  ShareCredentialNavigatorParamList,
  ShareCredentialRouteProp,
} from '../../navigators/share-credential/share-credential-routes';
import { shareCredentialGroupLabels } from '../../utils/credential-sharing-v2';
import { PAYMENT_SCA_TRANSACTION_TYPE } from '../../utils/payment-transaction';

const ProofRequestTransactionDataScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<ShareCredentialNavigationProp<'TransactionDetails'>>();
  const rootNavigation = useNavigation<RootNavigationProp>();
  const route = useRoute<ShareCredentialRouteProp<'TransactionDetails'>>();
  const onImagePreview = useCredentialImagePreview();
  const language = useCurrentLanguage();
  const {
    credentialQuerySelections,
    presentationDefinition,
    proofId,
    selectedCredentials,
    transactionId,
  } = route.params;
  const { data: transactionData } = useTransactionData(proofId, transactionId);

  const isPayment = transactionData?.type === PAYMENT_SCA_TRANSACTION_TYPE;
  const header =
    TRANSACTION_HEADER_CONFIG[transactionData?.type ?? ''] ??
    DEFAULT_TRANSACTION_HEADER;

  const [selectedCredential, setSelectedCredential] = useState<
    { credentialId: string; queryId: string } | undefined
  >(
    Object.entries(credentialQuerySelections)
      .filter(([_, selection]) =>
        selection[0]?.transactionDataIds?.includes(transactionId),
      )
      .map(([queryId, selection]) => ({
        credentialId: selection[0].credentialId,
        queryId,
      }))[0],
  );

  useEffect(() => {
    if (!transactionData || selectedCredential) {
      return;
    }
    const firstQueryId = transactionData.credentialQueryIds[0];
    const selectedCredentialId =
      credentialQuerySelections[firstQueryId]?.[0]?.credentialId;
    if (!selectedCredentialId) {
      return;
    }
    setSelectedCredential({
      credentialId: selectedCredentialId,
      queryId: firstQueryId,
    });
  }, [selectedCredential, credentialQuerySelections, transactionData]);

  const onConfirm = useCallback(() => {
    navigation.popTo(
      'ProofRequest',
      {
        selectedTransactionCredential: {
          ...selectedCredential,
          transactionId,
        },
      } as ShareCredentialNavigatorParamList['ProofRequest'],
      { merge: true },
    );
  }, [navigation, selectedCredential, transactionId]);

  const infoPressHandler = useCallback(() => {
    rootNavigation.navigate('NerdMode', {
      params: {
        proofId,
        transactionId,
      },
      screen: 'TransactionNerdMode',
    });
  }, [proofId, rootNavigation, transactionId]);

  const onSelectOption = (credentialQueryId: string) => (selected: boolean) => {
    if (!selected) {
      return;
    }
    const credentialId =
      credentialQuerySelections[credentialQueryId]?.[0]?.credentialId;
    if (!credentialId) {
      return;
    }
    setSelectedCredential({
      credentialId,
      queryId: credentialQueryId,
    });
  };

  const onSelectCredential = (credentialQueryId: string) => () => {
    const credentialQuery =
      presentationDefinition?.credentialQueries[credentialQueryId];
    if (
      !credentialQuery ||
      credentialQuery.credentialOrFailureHint.type_ !== 'APPLICABLE_CREDENTIALS'
    ) {
      return;
    }

    let preselectedCredentialIds: string[] | undefined =
      credentialQuerySelections[credentialQueryId]?.map((c) => c.credentialId);

    preselectedCredentialIds ??= [
      credentialQuery.credentialOrFailureHint.applicableCredentials[0]?.id,
    ];

    navigation.navigate('SelectCredentialV2', {
      credentialQuery,
      credentialQueryId,
      navigateBackToTransactions: true,
      preselectedCredentialIds,
    });
  };

  useEffect(() => {
    if (!selectedCredentials) {
      return;
    }
    navigation.setParams({ selectedCredentials: undefined });
    const { credentialQueryId, selectedCredentialIds } = selectedCredentials;
    setSelectedCredential({
      credentialId: selectedCredentialIds[0],
      queryId: credentialQueryId,
    });
  }, [navigation, selectedCredentials]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderBackButton
            onPress={onConfirm}
            testID="ProofRequestTransactionDataScreen.header.back"
          />
        ),
        rightItem: (
          <HeaderInfoButton
            onPress={infoPressHandler}
            testID="ProofRequestTransactionDataScreen.header.info"
          />
        ),
        static: true,
        title: translate('common.requestDetails'),
      }}
      modalPresentation
      scrollView={{
        testID: 'ProofRequestTransactionDataScreen.scroll',
      }}
      testID="ProofRequestTransactionDataScreen"
    >
      <View
        style={styles.content}
        testID="ProofRequestTransactionDataScreen.content"
      >
        <TransactionHeader
          logoInitials={header.logoInitials}
          style={[styles.container, { backgroundColor: colorScheme.white }]}
          title={
            isPayment
              ? transactionData?.transactionDataDisplay[0]?.title ??
                header.titleKey
              : header.titleKey
          }
        />
        {isPayment ? (
          <ProofRequestSet
            headerLabel="Details"
            showHeader={true}
            showSeparator={false}
          >
            <PaymentTransactionDetails transactionData={transactionData} />
          </ProofRequestSet>
        ) : (
          <ProofRequestSet
            headerLabel={header.titleKey}
            showHeader={true}
            showSeparator={false}
          >
            <View style={styles.data}>
              {transactionData?.transactionDataDisplay.map((data, index) => (
                <TransactionDataItem item={data} key={index} />
              ))}
            </View>
          </ProofRequestSet>
        )}
        <ProofRequestSet
          headerLabel={translate('common.credentialYouWillPresent')}
          showHeader={true}
          showSeparator={false}
        >
          {transactionData?.credentialQueryIds.map(
            (queryId, index, { length }) => {
              const lastItem = index === length - 1;
              const selected = selectedCredential?.queryId === queryId;
              return (
                <View key={queryId} style={styles.item}>
                  <ShareCredentialV2Group
                    key={queryId}
                    labels={shareCredentialGroupLabels()}
                    language={language}
                    lastGroup={lastItem}
                    onGroupSelect={onSelectOption(queryId)}
                    onImagePreview={onImagePreview}
                    onSelectCredential={onSelectCredential}
                    onSelectField={() => () => {}}
                    presentationDefinition={presentationDefinition}
                    requestGroup={[queryId]}
                    selected={selected}
                    selectedCredentials={credentialQuerySelections}
                    testID={concatTestID(
                      'ProofRequestTransactionDataScreen.credential',
                      index.toString(),
                    )}
                    valid={true}
                  />
                </View>
              );
            },
          )}
        </ProofRequestSet>
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    gap: 8,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  data: {
    gap: 8,
  },
  item: {
    marginBottom: 12,
  },
});

export default ProofRequestTransactionDataScreen;
