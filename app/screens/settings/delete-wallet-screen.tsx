import {
  Button,
  ButtonType,
  Checkbox,
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

const longPressTimeSeconds = 3;

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
        leftItem: HeaderBackButton,
        title: translate('deleteWalletScreen.title'),
      }}
      testID="DeleteWalletScreen"
    >
      <View style={styles.contentWrapper}>
        <Typography color={colorScheme.text} style={styles.description}>
          {translate('deleteWalletScreen.explainer')}
        </Typography>

        <View style={styles.bottom}>
          <Checkbox
            onValueChanged={setConfirmation}
            style={[styles.checkbox, { backgroundColor: colorScheme.grayDark }]}
            testID="DeleteWalletScreen.checkbox"
            text={translate('deleteWalletScreen.confirm')}
            value={confirmation}
          />
          <Button
            delayLongPress={longPressTimeSeconds * 1000}
            disabled={!confirmation}
            onLongPress={deleteAction}
            subtitle={translate('common.holdButton', {
              seconds: longPressTimeSeconds,
            })}
            testID="DeleteWalletScreen.mainButton"
            title={translate('common.delete')}
            type={confirmation ? ButtonType.Primary : ButtonType.Border}
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
