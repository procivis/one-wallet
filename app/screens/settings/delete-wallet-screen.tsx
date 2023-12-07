import {
  ActivityIndicator,
  Button,
  Checkbox,
  CheckboxAlignment,
  GradientBackground,
  theme,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from 'react-query';

import { removePin } from '../../components/pin-code/pin-code';
import { useGetONECore, useReinitializeONECore } from '../../hooks/core-context';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException, reportTraceInfo } from '../../utils/reporting';

const DeletionConfirmScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();
  const { top, bottom } = useSafeAreaInsets();
  const getCore = useGetONECore();
  const reinitializeONECore = useReinitializeONECore();
  const queryClient = useQueryClient();

  const [confirmation, setConfirmation] = useState(false);
  const [deletingWallet, setDeletingWallet] = useState(false);

  const { walletStore } = useStores();

  const deleteAction = useCallback(async () => {
    reportTraceInfo('Wallet', 'Deleting wallet');
    setDeletingWallet(true);
    await getCore()
      .uninitialize(true)
      .then(reinitializeONECore)
      .then(() => queryClient.invalidateQueries())
      .catch((e) => reportException(e, 'Failed to uninitialize core'));

    walletStore.walletDeleted();
    await removePin().catch((e) => reportException(e, 'Failed to remove PIN'));
    navigation.popToTop();
    navigation.replace('Onboarding');
  }, [getCore, navigation, queryClient, reinitializeONECore, walletStore]);

  return (
    <>
      <GradientBackground />
      {deletingWallet ? (
        <ActivityIndicator />
      ) : (
        <View style={{ paddingTop: top }}>
          <ScrollView contentContainerStyle={styles.scrollContent} alwaysBounceVertical={false}>
            <Typography
              accessibilityRole="header"
              style={styles.contentTitle}
              bold={true}
              color={colorScheme.text}
              align="center"
              size="h1">
              {translate('deleteWalletScreen.title')}
            </Typography>
            <Typography style={styles.contentDescription} align="center" color={colorScheme.text}>
              {translate('deleteWalletScreen.explainer')}
            </Typography>

            <Checkbox
              style={styles.checkbox}
              alignment={CheckboxAlignment.centered}
              text={translate('deleteWalletScreen.confirm')}
              value={confirmation}
              onValueChanged={setConfirmation}
            />
            <View style={[styles.buttonContainer, { paddingBottom: bottom }]}>
              <Button style={styles.button} onPress={navigation.goBack} type="light">
                {translate('common.cancel')}
              </Button>
              <View style={styles.buttonsSpacing} />
              <Button style={styles.button} disabled={!confirmation} onPress={deleteAction}>
                {translate('common.delete')}
              </Button>
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonsSpacing: {
    width: theme.padding,
  },
  checkbox: {
    marginBottom: 12,
  },
  contentDescription: {
    flex: 1,
    marginTop: theme.grid,
  },
  contentTitle: {
    marginTop: theme.paddingM,
  },
  scrollContent: {
    minHeight: '100%',
    paddingBottom: theme.paddingM,
    paddingHorizontal: theme.padding,
    paddingTop: theme.paddingM,
  },
});

export default DeletionConfirmScreen;
