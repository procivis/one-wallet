import {
  DetailScreen,
  formatDateTime,
  Typography,
  useAppColorScheme,
  useMemoAsync,
} from '@procivis/react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FunctionComponent } from 'react';
import { StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-ultimate-config';

import { useGetONECore } from '../../hooks/core-context';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const AppInformationScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<SettingsNavigationProp<'AppInformation'>>();
  const getCore = useGetONECore();

  const appVersion = `v${DeviceInfo.getVersion()}.${DeviceInfo.getBuildNumber()} (${Config.CONFIG_NAME}, ${
    Config.ENVIRONMENT
  })`;

  const coreVersion = useMemoAsync(async () => {
    const version = await getCore().getVersion();
    return `ONE-core: v${version.pipelineId} (${formatDateTime(new Date(version.buildTime))}, ${version.branch}, ${
      version.commit
    })`;
  }, [getCore]);

  return (
    <DetailScreen
      onBack={navigation.goBack}
      title={translate('appInformation.title')}
      style={{ backgroundColor: colorScheme.white }}>
      <Typography accessibilityRole="header" color={colorScheme.text} size="h1">
        {translate('appInformation.app.title')}
      </Typography>
      <Typography color={colorScheme.text} size="h2">
        {appVersion}
      </Typography>
      <Typography color={colorScheme.text}>{coreVersion}</Typography>
      <Typography style={styles.contentDescription} color={colorScheme.text}>
        {translate('appInformation.app.description')}
      </Typography>
      <Typography accessibilityRole="header" color={colorScheme.text} size="h1">
        {translate('appInformation.company.title')}
      </Typography>
      <Typography style={styles.contentDescription} color={colorScheme.text}>
        {translate('appInformation.company.description')}
      </Typography>
    </DetailScreen>
  );
};

const styles = StyleSheet.create({
  contentDescription: {
    marginBottom: 24,
    marginTop: 8,
  },
});

export default AppInformationScreen;
