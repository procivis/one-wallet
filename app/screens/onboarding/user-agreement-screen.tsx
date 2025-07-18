import {
  Button,
  ButtonType,
  Checkbox,
  ContrastingStatusBar,
  Header,
  LinkIcon,
  reportException,
  TouchableOpacity,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import { OnboardingNavigationProp } from '../../navigators/onboarding/onboarding-routes';

const Link: FC<{ label: string; testID?: string; url: string }> = ({
  label,
  url,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const onPress = useCallback(() => {
    Linking.openURL(url).catch((err) =>
      reportException(err, `Failed to open user agreement URL: ${url}`),
    );
  }, [url]);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.link, { backgroundColor: colorScheme.background }]}
      testID={testID}
    >
      <Typography color={colorScheme.text} preset="s">
        {label}
      </Typography>
      <LinkIcon color={colorScheme.black} />
    </TouchableOpacity>
  );
};

export const UserAgreementScreen: FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp<'UserAgreement'>>();
  const colorScheme = useAppColorScheme();
  const [checked, setChecked] = useState(false);

  const onContinue = useCallback(
    () => navigation.navigate('Security'),
    [navigation],
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colorScheme.white }]}
      testID="UserAgreementScreen"
    >
      <ContrastingStatusBar backgroundColor={colorScheme.white} />
      <Header
        onBack={navigation.goBack}
        title={translate('common.userAgreement')}
      />
      <View style={styles.top}>
        <Typography color={colorScheme.text} style={styles.subtitle}>
          {translate('info.onboarding.userAgreement.subtitle')}
        </Typography>
        <Link
          label={translate('common.termsOfService')}
          testID="UserAgreementScreen.termsOfService"
          url={translate('common.termsOfServiceLink')}
        />
        <Link
          label={translate('common.privacyPolicy')}
          testID="UserAgreementScreen.privacyPolicy"
          url={translate('common.privacyPolicyLink')}
        />
      </View>

      <View style={styles.bottom}>
        <Checkbox
          onValueChanged={setChecked}
          testID="UserAgreementScreen.checkbox"
          text={translate('info.onboarding.userAgreement.checkbox')}
          value={checked}
        />
        <Button
          disabled={!checked}
          onPress={onContinue}
          style={[
            styles.button,
            !checked && { borderColor: colorScheme.background },
          ]}
          testID="UserAgreementScreen.accept"
          title={translate('common.accept')}
          type={checked ? ButtonType.Primary : ButtonType.Secondary}
        />
      </View>
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
  link: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 12,
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
});
