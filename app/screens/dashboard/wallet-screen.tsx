import {
  FeatureScreen,
  formatDateTime,
  ListView,
  TextAvatar,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/core';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { EmptyIcon, NextIcon, SettingsIcon } from '../../components/icon/wallet-icon';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import TabBarAwareContainer from './tab-bar-aware-container';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();

  const {
    locale: { locale },
    walletStore: { credentials },
  } = useStores();

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleCredentialPress = useCallback(
    (_, index: number) => {
      const credentialId = credentials[index]?.id;
      navigation.navigate('CredentialDetail', { credentialId });
    },
    [credentials, navigation],
  );

  return (
    <FeatureScreen
      testID="WalletScreen"
      key={locale}
      title={translate('wallet.walletScreen.title')}
      headerBackground={colorScheme.lineargradient}
      style={{ backgroundColor: colorScheme.background }}
      actionButtons={[
        {
          key: 'settings',
          accessibilityLabel: translate('wallet.settings.title'),
          content: SettingsIcon,
          onPress: handleWalletSettingsClick,
        },
      ]}>
      <TabBarAwareContainer>
        <ListView
          title={translate(
            credentials.length
              ? 'wallet.walletScreen.credentialsList.title'
              : 'wallet.walletScreen.credentialsList.title.empty',
            { credentialsCount: credentials.length },
          )}
          emptyListIcon={{ component: <EmptyIcon color={colorScheme.lightGrey} /> }}
          emptyListIconStyle={styles.emptyIcon}
          emptyListTitle={translate('wallet.walletScreen.credentialsList.empty.title')}
          emptyListSubtitle={translate('wallet.walletScreen.credentialsList.empty.subtitle')}
          items={credentials.map((credential) => ({
            title: credential.schema,
            subtitle: formatDateTime(credential.issuedOn),
            icon: { component: <TextAvatar produceInitials={true} text={credential.schema} innerSize={48} /> },
            iconStyle: styles.itemIcon,
            rightAccessory: <NextIcon color={colorScheme.text} />,
          }))}
          onItemSelected={handleCredentialPress}
        />
      </TabBarAwareContainer>
    </FeatureScreen>
  );
});

const styles = StyleSheet.create({
  emptyIcon: {
    marginBottom: 2,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
});

export default WalletScreen;
