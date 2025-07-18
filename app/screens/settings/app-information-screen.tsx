import {
  BackButton,
  ButtonSetting,
  LinkIcon,
  reportException,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { HeaderInfoButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const Link: FC<{ label: string; url: string }> = ({ label, url }) => {
  const colorScheme = useAppColorScheme();
  const openURL = useCallback(() => {
    Linking.openURL(url).catch((e) =>
      reportException(e, 'Failed to open about link'),
    );
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
        leftItem: (
          <BackButton
            onPress={navigation.goBack}
            testID="AppInformationScreen.back"
          />
        ),
        rightItem: (
          <HeaderInfoButton
            onPress={infoPressHandler}
            testID="AppInformationScreen.header.info"
          />
        ),
        title: translate('common.aboutProcivis'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID="AppInformationScreen"
    >
      <View style={styles.contentContainer}>
        <Typography color={colorScheme.text} style={styles.contentDescription}>
          {translate('info.appInformation.description')}
        </Typography>
        <Link
          label={translate('common.procivisAgWebsite')}
          url={translate('common.procivisWebsiteLink')}
        />
        <Link
          label={translate('common.documentation')}
          url={translate('common.procivisDocsLink')}
        />
        <Link
          label={translate('common.github')}
          url={translate('common.procivisgithubLink')}
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
    opacity: 0.7,
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
