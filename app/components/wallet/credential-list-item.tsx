import {
  concatTestID,
  CredentialDetailsCardListItem,
  getCredentialCardPropsFromCredential,
  NextIcon,
  useAppColorScheme,
  useCoreConfig,
  useCredentialDetail,
  useWalletUnitAttestation,
} from '@procivis/one-react-native-components';
import { CredentialListItem } from '@procivis/react-native-one-core';
import { useIsFocused } from '@react-navigation/native';
import React, { FC, useMemo } from 'react';
import {
  Dimensions,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { credentialCardLabels } from '../../utils/credential';
import { walletUnitAttestationState } from '../../utils/wallet-unit';

type WalletCredentialListItemProps = {
  expandedCredentialId: string | undefined;
  handleCredentialPress: (credentialId: string) => void;
  index: ListRenderItemInfo<CredentialListItem>['index'];
  item: ListRenderItemInfo<CredentialListItem>['item'];
  lastItem: boolean;
  onFoldCards: (credentialId?: string) => void;
  onHeaderPress: (credentialId?: string) => void;
};

const WalletCredentialListItem: FC<WalletCredentialListItemProps> = ({
  expandedCredentialId,
  handleCredentialPress,
  item,
  index,
  lastItem,
  onFoldCards,
  onHeaderPress,
}) => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const { data: config } = useCoreConfig();
  const { data: credential } = useCredentialDetail(item.id, isFocused);
  const { data: walletUnitAttestation, isLoading: isLoadingWUA } =
    useWalletUnitAttestation();
  const cardWidth = useMemo(() => Dimensions.get('window').width - 32, []);

  if (!credential || !config || isLoadingWUA) {
    return null;
  }

  const testID = concatTestID('WalletScreen.credential', credential.id);
  const { header, ...cardProps } = getCredentialCardPropsFromCredential(
    credential,
    credential.claims,
    config,
    walletUnitAttestationState(walletUnitAttestation),
    undefined,
    concatTestID(testID, 'card'),
    credentialCardLabels(),
  );
  const headerAccessory = (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => handleCredentialPress(credential.id)}
      style={styles.headerAccessory}
      testID={concatTestID(testID, 'card.header.openDetail')}
    >
      <NextIcon color={colorScheme.text} />
    </TouchableOpacity>
  );
  const expanded = lastItem || expandedCredentialId === credential.id;
  return (
    <CredentialDetailsCardListItem
      attributes={[]}
      card={{
        ...cardProps,
        credentialId: credential.id,
        header: {
          ...header,
          accessory: headerAccessory,
        },
        onCardPress: expanded ? onFoldCards : undefined,
        onHeaderPress: lastItem ? onFoldCards : onHeaderPress,
        width: cardWidth,
      }}
      detailsCardStyle={styles.listItemExpanded}
      expanded={expanded}
      key={`${index}-${lastItem ? 'last' : ''}`}
      lastItem={lastItem}
      style={styles.listItem}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  headerAccessory: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  listItem: {
    marginBottom: 8,
  },
  listItemExpanded: {
    marginBottom: 32,
  },
});

export default WalletCredentialListItem;
