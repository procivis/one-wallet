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
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import {
  WalletUnitRegistrationNavigationProp,
  WalletUnitRegistrationRouteProp,
} from '../../navigators/wallet-unit-registration/wallet-unit-registration-routes';

const WalletUnitInfoScreen: FC = () => {
  const route = useRoute<WalletUnitRegistrationRouteProp<'Info'>>();
  const navigation =
    useNavigation<WalletUnitRegistrationNavigationProp<'Info'>>();
  const colorScheme = useAppColorScheme();

  const onContinue = useCallback(
    () => navigation.navigate('Registration', route.params),
    [navigation, route],
  );

  const testID = 'WalletUnitInfoScreen';

  return (
    <ScrollViewScreen
      header={{
        backgroundColor: colorScheme.white,
        leftItem:
          route.params.operation === 'refresh' ? (
            <HeaderCloseButton testID={concatTestID(testID, 'header.back')} />
          ) : undefined,
        modalHandleVisible: true,
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
          onPress={onContinue}
          style={styles.button}
          testID={concatTestID(testID, 'continue')}
          title={translate('common.continue')}
          type={ButtonType.Primary}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 12,
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
