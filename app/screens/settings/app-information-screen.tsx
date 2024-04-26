import {
  BackButton,
  LinkIcon,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { HeaderInfoButton } from '../../components/navigation/header-buttons';
import ScrollViewScreen from '../../components/screens/scroll-view-screen';
import ButtonSetting from '../../components/settings/button-setting';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const Link: FC<{ label: string; url: string }> = ({ label, url }) => {
  const colorScheme = useAppColorScheme();
  const openURL = useCallback(() => {
    Linking.openURL(url);
  }, [url]);

  return (
    <ButtonSetting
      accessory={<LinkIcon color={colorScheme.text} />}
      onPress={openURL}
      style={[styles.link, { backgroundColor: colorScheme.background }]}
      title={label}
    />
  );
};

const AppInformationScreen: FC = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'AppInformation'>>();

  const infoPressHandler = useCallback(() => {
    navigation.navigate('AppInformationNerd');
  }, [navigation]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: <BackButton onPress={navigation.goBack} />,
        rightItem: <HeaderInfoButton onPress={infoPressHandler} />,
        title: translate('appInformation.app.title'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID="AppInformationScreen"
    >
      <View style={styles.contentContainer}>
        <Typography color={colorScheme.text} style={styles.contentDescription}>
          {translate('appInformation.app.description')}
        </Typography>
        <Link
          label={translate('appInformation.oneProject.label')}
          url={translate('appInformation.oneProject.link')}
        />
        <Link
          label={translate('appInformation.oneDocumentation.label')}
          url={translate('appInformation.oneDocumentation.link')}
        />

        <Typography
          accessibilityRole="header"
          color={colorScheme.text}
          preset="l"
          style={styles.header}
        >
          {translate('appInformation.company.title')}
        </Typography>
        <Typography color={colorScheme.text} style={styles.contentDescription}>
          {translate('appInformation.company.description')}
        </Typography>
        <Link
          label={translate('appInformation.company.label')}
          url={translate('appInformation.company.link')}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
  },
  contentDescription: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 24,
    marginTop: 40,
  },
  link: {
    borderRadius: 12,
    height: 68,
    marginBottom: 8,
    marginHorizontal: 0,
    paddingHorizontal: 12,
  },
});

export default AppInformationScreen;
