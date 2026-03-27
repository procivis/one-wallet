import {
  Button,
  ButtonType,
  Checkbox,
  ContrastingStatusBar,
  Header,
  LoaderView,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
  useWalletUnitTrustCollections,
  useWalletUnitUpdate,
} from '@procivis/one-react-native-components';
import { Route, useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import i18n from '../../i18n/i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-routes';
import { resetNavigationAction } from '../../utils/navigation';

type TrustEcosystemProps = {
  description?: string;
  icon: ImageSourcePropType;
  label?: string;
  selected: boolean;
  setSelected: (selected: boolean) => void;
  testID?: string;
};

const TrustEcosystem: FC<TrustEcosystemProps> = ({
  description,
  icon,
  label,
  selected,
  setSelected,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const onPress = useCallback(() => {
    setSelected(!selected);
  }, [setSelected, selected]);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.trustEcosystem,
        { backgroundColor: colorScheme.background },
      ]}
      testID={testID}
    >
      <Image source={icon} style={styles.trustEcosystemIcon} />
      <View style={styles.trustEcosystemLabels}>
        <Typography color={colorScheme.text} numberOfLines={1} preset="s">
          {label}
        </Typography>
        <Typography color={colorScheme.text} numberOfLines={1} preset="s">
          {description}
        </Typography>
      </View>
      <Checkbox
        onValueChanged={onPress}
        testID={`${testID}.checkbox`}
        value={selected}
      />
    </TouchableOpacity>
  );
};

export type TrustEcosystemsRouteParams =
  | {
      resetToDashboard?: boolean;
    }
  | undefined;

export const TrustEcosystemsScreen: FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route =
    useRoute<Route<'TrustEcosystems', TrustEcosystemsRouteParams>>();
  const colorScheme = useAppColorScheme();
  const [selectedEcosystems, setSelectedEcosystems] = useState<string[]>([]);
  const {
    locale: { locale },
    walletStore: { registeredWalletUnitId },
  } = useStores();
  const { data: walletUnit, isLoading } = useWalletUnitTrustCollections(
    registeredWalletUnitId,
  );
  const trustCollections = walletUnit?.trustCollections;
  const { mutateAsync: updateWalletUnit } = useWalletUnitUpdate();

  useEffect(() => {
    if (isLoading || !trustCollections) {
      return;
    }
    setSelectedEcosystems(
      trustCollections.filter((tc) => tc.selected).map((tc) => tc.id),
    );
  }, [isLoading, trustCollections]);

  const language = locale ?? i18n.defaultLocale ?? 'en';

  const onContinue = useCallback(() => {
    if (registeredWalletUnitId) {
      updateWalletUnit({
        update: { trustCollections: selectedEcosystems },
        walletUnitId: registeredWalletUnitId,
      });
    }
    if (route.params?.resetToDashboard) {
      resetNavigationAction(navigation, [
        { name: 'Dashboard', params: { screen: 'Wallet' } },
      ]);
    } else {
      navigation.goBack();
    }
  }, [
    navigation,
    registeredWalletUnitId,
    route.params?.resetToDashboard,
    selectedEcosystems,
    updateWalletUnit,
  ]);

  const setSelected = useCallback(
    (id: string) => (selected: boolean) => {
      if (selected) {
        setSelectedEcosystems((previous) => [...previous, id]);
      } else {
        setSelectedEcosystems((previous) => previous.filter((te) => te !== id));
      }
    },
    [],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colorScheme.white }]}
      testID="TrustEcosystemsScreen"
    >
      <ContrastingStatusBar backgroundColor={colorScheme.white} />
      <Header
        onBack={navigation.goBack}
        title={translate('common.trustEcosystems')}
      />
      {isLoading ? (
        <LoaderView animate={true} />
      ) : (
        <>
          <View style={styles.top}>
            <Typography color={colorScheme.text} style={styles.subtitle}>
              {translate('info.trustEcosystems.subtitle')}
            </Typography>
            {trustCollections?.map((tc) => (
              <TrustEcosystem
                description={
                  tc.description.find((l) => l.lang === language)?.value
                }
                icon={{ uri: tc.logo }}
                key={tc.id}
                label={tc.displayName.find((l) => l.lang === language)?.value}
                selected={selectedEcosystems.includes(tc.id)}
                setSelected={setSelected(tc.id)}
                testID={`TrustEcosystemsScreen.item.${tc.id}`}
              />
            ))}
          </View>

          <View style={styles.bottom}>
            <Button
              disabled={selectedEcosystems.length === 0}
              onPress={onContinue}
              style={[
                styles.button,
                selectedEcosystems.length === 0 && {
                  borderColor: colorScheme.background,
                },
              ]}
              testID="TrustEcosystemsScreen.accept"
              title={translate('common.accept')}
              type={
                selectedEcosystems.length === 0
                  ? ButtonType.Secondary
                  : ButtonType.Primary
              }
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottom: {
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 12,
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  top: {
    flex: 1,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  trustEcosystem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  trustEcosystemIcon: {
    borderRadius: 4,
    height: 32,
    marginRight: 16,
    width: 32,
  },
  trustEcosystemLabels: {
    flex: 1,
    flexDirection: 'column',
  },
});
