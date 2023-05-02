import { theme, Title, useAppColorScheme } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/core';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import WalletSettingsIcon from '../../../assets/images/wallet/wallet-settings';
import { GradientBackground } from '../../components';
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
    <React.Fragment key={locale}>
      <GradientBackground />
      <SafeAreaView style={styles.topWrapper} edges={['top']}>
        <ScrollView>
          <TabBarAwareContainer>
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <Title accessibilityRole="header" bold={true} color={colorScheme.text} align="left" size="big">
                    {translate('wallet.walletScreen.title')}
                  </Title>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={translate('wallet.settings.title')}
                  style={styles.walletSettingsButton}
                  onPress={handleWalletSettingsClick}>
                  <WalletSettingsIcon />
                </TouchableOpacity>
              </View>
            </View>
          </TabBarAwareContainer>
        </ScrollView>
      </SafeAreaView>
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: theme.paddingM,
  },
  loader: {
    height: 375,
  },
  switch: {
    marginBottom: theme.padding,
    marginLeft: theme.padding,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: theme.padding,
    paddingBottom: theme.paddingM,
  },
  topWrapper: {
    paddingTop: theme.grid,
  },
  walletSettingsButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: theme.padding,
    width: 40,
  },
});

export default WalletScreen;
