import {
  Button,
  ButtonType,
  concatTestID,
  HeaderCloseButton,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { useStores } from '../../models';
import {
  WalletUnitRegistrationNavigationProp,
  WalletUnitRegistrationRouteProp,
} from '../../navigators/wallet-unit-registration/wallet-unit-registration-routes';

const WalletUnitInfoScreen: FC = () => {
  const route = useRoute<WalletUnitRegistrationRouteProp<'Info'>>();
  const navigation =
    useNavigation<WalletUnitRegistrationNavigationProp<'Info'>>();
  const colorScheme = useAppColorScheme();
  const {
    walletStore: {
      walletProvider: { userAuthentication },
    },
  } = useStores();

  const authenticationRequired = userAuthentication?.required;

  const onLinkAccount = useCallback(
    () => navigation.navigate('Registration', route.params),
    [navigation, route],
  );
  const onSkip = useCallback(
    () =>
      navigation.navigate('Registration', {
        ...route.params,
        skipAuthentication: true,
      }),
    [navigation, route],
  );

  const testID = 'WalletUnitInfoScreen';

  return (
    <ScrollViewScreen
      header={{
        leftItem: !authenticationRequired ? (
          <HeaderCloseButton
            onPress={onSkip}
            testID={concatTestID(testID, 'header.close')}
          />
        ) : undefined,
        modalHandleVisible: Platform.OS === 'ios',
        static: true,
        title: translate('common.walletActivation'),
      }}
      modalPresentation={true}
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      style={{ backgroundColor: colorScheme.background }}
      testID={testID}
    >
      <View style={styles.top}>
        <Typography color={colorScheme.text} preset="l" style={styles.title}>
          {translate('common.linkAccount')}
        </Typography>
        <Typography color={colorScheme.text} style={styles.subtitle}>
          {translate('walletUnitRegistration.info.description')}
        </Typography>
      </View>

      <View style={styles.bottom}>
        <Button
          onPress={onLinkAccount}
          testID={concatTestID(testID, 'linkAccount')}
          title={translate('common.linkAccount')}
          type={ButtonType.Primary}
        />
        {!authenticationRequired && (
          <Button
            onPress={onSkip}
            style={styles.skipButton}
            testID={concatTestID(testID, 'skip')}
            title={translate('common.skip')}
            type={ButtonType.Secondary}
          />
        )}
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  skipButton: {
    marginTop: 4,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  title: {
    marginBottom: 8,
    marginTop: 12,
  },
  top: {
    flex: 1,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
});

export default WalletUnitInfoScreen;
