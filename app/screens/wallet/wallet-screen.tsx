import { FeatureScreen, Typography, useAppColorScheme } from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/core';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg';

import WalletSettingsIcon from '../../../assets/images/wallet/wallet-settings';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import TabBarAwareContainer from './tab-bar-aware-container';

const EmptyIcon: React.FunctionComponent<SvgProps> = ({ color, ...props }) => {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none" {...props}>
      <Path
        d="M47.4362 8H23.0789C20.9791 8 19.2993 9.67982 19.2993 11.7796V15.5592H16.7796C14.6798 15.5592 13 17.239 13 19.3388V27.1644H15.5197V19.3388C15.5197 18.6668 16.1077 18.0789 16.7796 18.0789H40.717C41.3889 18.0789 41.9768 18.6668 41.9768 19.3388V52.0951C41.9768 52.7671 41.3889 53.355 40.717 53.355H16.7796C16.1077 53.355 15.5197 52.7671 15.5197 52.0951V27.1644H13V52.0951C13 54.1949 14.6798 55.8747 16.7796 55.8747H40.717C42.8167 55.8747 44.4965 54.1949 44.4965 52.0951V48.3156H47.4362C49.536 48.3156 51.2158 46.6357 51.2158 44.536V11.7796C51.2158 9.67982 49.536 8 47.4362 8ZM48.6961 44.536C48.6961 45.2079 48.1081 45.7958 47.4362 45.7958H44.4965V19.3388C44.4965 17.239 42.8167 15.5592 40.717 15.5592H21.819V11.7796C21.819 11.1077 22.407 10.5197 23.0789 10.5197H47.4362C48.1081 10.5197 48.6961 11.1077 48.6961 11.7796V44.536Z"
        fill={color}
      />
    </Svg>
  );
};

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
      style={{ backgroundColor: colorScheme.background }}
      actionButtons={[
        {
          key: 'settings',
          accessibilityLabel: translate('wallet.settings.title'),
          content: WalletSettingsIcon,
          onPress: handleWalletSettingsClick,
        },
      ]}>
      <TabBarAwareContainer>
        <View style={[styles.credentials, { backgroundColor: colorScheme.white }]}>
          <Typography size="sml" bold={true} caps={true} accessibilityRole="header">
            {translate('wallet.walletScreen.credentialsList.title.empty')}
          </Typography>
          <View style={styles.emptyWrapper}>
            <EmptyIcon color={colorScheme.lightGrey} />
            <Typography size="sml" bold={true} style={styles.empty} color={colorScheme.textSecondary} align="center">
              {translate('wallet.walletScreen.credentialsList.empty.title')}
            </Typography>
            <Typography size="sml" style={styles.empty} color={colorScheme.textSecondary} align="center">
              {translate('wallet.walletScreen.credentialsList.empty.subtitle')}
            </Typography>
          </View>
        </View>
      </TabBarAwareContainer>
    </FeatureScreen>
  );
});

const styles = StyleSheet.create({
  credentials: {
    borderRadius: 20,
    padding: 24,
    paddingTop: 12,
  },
  empty: {
    marginTop: 2,
  },
  emptyWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
});

export default WalletScreen;
