import {
  Checkbox,
  HoldButton,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HeaderBackButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const DeleteWalletScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'DeleteWallet'>>();

  const [confirmation, setConfirmation] = useState(false);

  const deleteAction = useCallback(() => {
    navigation.navigate('DeleteWalletProcess');
  }, [navigation]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: <HeaderBackButton testID="DeleteWalletScreen.header.back" />,
        title: translate('deleteWalletScreen.title'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID="DeleteWalletScreen"
    >
      <View style={styles.contentWrapper}>
        <Typography color={colorScheme.text} style={styles.description}>
          {translate('deleteWalletScreen.explainer')}
        </Typography>

        <View style={styles.bottom}>
          <Checkbox
            onValueChanged={setConfirmation}
            style={[
              styles.checkbox,
              { backgroundColor: colorScheme.background },
            ]}
            testID="DeleteWalletScreen.checkbox"
            text={translate('deleteWalletScreen.confirm')}
            value={confirmation}
          />
          <HoldButton
            disabled={!confirmation}
            onFinished={deleteAction}
            subtitlePrefix={translate('common.holdButton.subtitlePrefix')}
            subtitleSuffix={translate('common.holdButton.subtitleSuffix')}
            testID="DeleteWalletScreen.mainButton"
            title={translate('common.delete')}
          />
        </View>
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
    paddingTop: 16,
  },
  checkbox: {
    marginBottom: 12,
  },
  contentWrapper: {
    flex: 1,
    marginHorizontal: 12,
  },
  description: {
    marginHorizontal: 8,
  },
});

export default DeleteWalletScreen;
