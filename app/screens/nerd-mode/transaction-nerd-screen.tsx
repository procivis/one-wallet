import {
  ActivityIndicator,
  addElementIf,
  concatTestID,
  NerdModeItemProps,
  NerdModeScreen,
  useTransactionData,
} from '@procivis/one-react-native-components';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { FunctionComponent } from 'react';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { NerdModeRouteProp } from '../../navigators/nerd-mode/nerd-mode-routes';
import { attributesLabels } from './utils';

const formatRawTransactionData = (rawTransactionData: string): string => {
  try {
    return JSON.stringify(JSON.parse(rawTransactionData), null, 1);
  } catch {
    return rawTransactionData;
  }
};

const TransactionDataNerdView: FunctionComponent = () => {
  const isFocused = useIsFocused();
  const nav = useNavigation();
  const route = useRoute<NerdModeRouteProp<'TransactionNerdMode'>>();
  const copyToClipboard = useCopyToClipboard();

  const { proofId, transactionId } = route.params;
  const { data: transactionData } = useTransactionData(proofId, transactionId);

  if (!transactionData) {
    return <ActivityIndicator animate={isFocused} />;
  }

  const transactionFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.transactionId'),
      highlightedText: transactionData.id,
      testID: 'transactionId',
    },
    {
      attributeKey: translate('common.type'),
      attributeText: transactionData.type,
      testID: 'type',
    },
    ...addElementIf(Boolean(transactionData.credentialQueryIds.length), {
      attributeKey: translate('common.credentialQueryIds'),
      attributeText: transactionData.credentialQueryIds.join(', '),
      canBeCopied: true,
      testID: 'credentialQueryIds',
    }),
    ...addElementIf(Boolean(transactionData.rawTransactionData), {
      attributeKey: translate('common.rawTransactionData'),
      attributeText: formatRawTransactionData(
        transactionData.rawTransactionData ?? '',
      ),
      canBeCopied: true,
      testID: 'rawTransactionData',
    }),
  ];

  const displaySections = transactionData.transactionDataDisplay
    .filter(({ attributes }) => attributes.length)
    .map(({ attributes, title }, index) => ({
      data: attributes.map(({ key, value }) => ({
        attributeKey: key,
        attributeText: value,
        canBeCopied: true,
        testID: concatTestID('display', index.toString(), key),
      })),
      title: title ?? translate('common.requestDetails'),
    }));

  return (
    <NerdModeScreen
      labels={attributesLabels}
      onClose={nav.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={[
        {
          data: transactionFields,
          title: translate('common.transactionData'),
        },
        ...displaySections,
      ]}
      testID="TransactionDataNerdView"
      title={translate('common.moreInformation')}
    />
  );
};

export default TransactionDataNerdView;
