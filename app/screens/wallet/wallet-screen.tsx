import { FeatureScreen, useAppColorScheme } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/core';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import WalletSettingsIcon from '../../../assets/images/wallet/wallet-settings';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import TabBarAwareContainer from './tab-bar-aware-container';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();

  const {
    locale: { locale },
  } = useStores();

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  return (
    <FeatureScreen
      key={locale}
      title={translate('wallet.walletScreen.title')}
      headerBackground={colorScheme.lineargradient}
      actionButtons={[
        {
          key: 'settings',
          accessibilityLabel: translate('wallet.settings.title'),
          content: WalletSettingsIcon,
          onPress: handleWalletSettingsClick,
        },
      ]}>
      <TabBarAwareContainer>
        <View style={styles.container}></View>
      </TabBarAwareContainer>
    </FeatureScreen>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default WalletScreen;
