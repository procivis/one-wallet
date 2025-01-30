import {
  concatTestID,
  CredentialDetailsCardListItem,
  getCredentialCardPropsFromCredential,
  NextIcon,
  useAppColorScheme,
  useCoreConfig,
  useCredentialDetail,
} from '@procivis/one-react-native-components';
import { CredentialListItem } from '@procivis/react-native-one-core';
import { useIsFocused } from '@react-navigation/native';
import React, { FC } from 'react';
import {
  SectionListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { credentialCardLabels } from '../../utils/credential';

type WalletCredentialListItemProps = {
  expandedCredentialId: string | undefined;
  handleCredentialPress: (credentialId: string) => void;
  index: SectionListRenderItemInfo<CredentialListItem>['index'];
  item: SectionListRenderItemInfo<CredentialListItem>['item'];
  onFoldCards: (credentialId?: string) => void;
  onHeaderPress: (credentialId?: string) => void;
  section: SectionListRenderItemInfo<CredentialListItem>['section'];
};

const WalletCredentialListItem: FC<WalletCredentialListItemProps> = ({
  expandedCredentialId,
  handleCredentialPress,
  item,
  index,
  onFoldCards,
  onHeaderPress,
  section,
}) => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const { data: config } = useCoreConfig();
  const { data: credential } = useCredentialDetail(item.id, isFocused);

  if (!credential || !config) {
    return null;
  }

  const testID = concatTestID('WalletScreen.credential', credential.id);
  const { header, ...cardProps } = getCredentialCardPropsFromCredential(
    credential,
    credential.claims,
    config,
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
  const lastItem = index === section.data.length - 1;
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
