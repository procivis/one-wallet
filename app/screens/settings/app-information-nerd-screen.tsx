import {
  formatDateTime,
  NerdModeItemProps,
  NerdModeScreen,
  useMemoAsync,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-ultimate-config';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { useONECore } from '../../hooks/core/core-context';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

const AppInformationNerdScreen: FC = () => {
  const navigation =
    useNavigation<SettingsNavigationProp<'AppInformationNerd'>>();
  const copyToClipboard = useCopyToClipboard();

  const appVersion = `v${DeviceInfo.getVersion()}.${DeviceInfo.getBuildNumber()}`;
  const appFlavor = `${Config.CONFIG_NAME}, ${Config.ENVIRONMENT}`;
  const appFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('appInformationNerd.version'),
      canBeCopied: true,
      highlightedText: appVersion,
    },
    {
      attributeKey: translate('appInformationNerd.flavor'),
      attributeText: appFlavor,
      canBeCopied: true,
    },
  ];

  const { core } = useONECore();
  const coreInfo = useMemoAsync(() => core.getVersion(), [core]);
  const coreVersion = coreInfo ? `v${coreInfo.pipelineId}` : undefined;
  const coreRev = coreInfo?.tag || coreInfo?.commit;
  const coreBuildDate = coreInfo
    ? formatDateTime(new Date(coreInfo.buildTime))
    : undefined;
  const coreFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('appInformationNerd.version'),
      canBeCopied: true,
      highlightedText: coreVersion,
    },
    {
      attributeKey: translate('appInformationNerd.rev'),
      attributeText: coreRev,
      canBeCopied: true,
    },
    {
      attributeKey: translate('appInformationNerd.date'),
      attributeText: coreBuildDate,
      canBeCopied: true,
    },
  ];

  return (
    <NerdModeScreen
      labels={{
        collapse: translate('nerdView.action.collapseAttribute'),
        expand: translate('nerdView.action.expandAttribute'),
      }}
      onClose={navigation.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={[
        {
          data: appFields,
          title: translate('appInformationNerd.app'),
        },
        {
          data: coreFields,
          title: translate('appInformationNerd.core'),
        },
      ]}
      testID="AppInformationNerdScreen"
      title={translate('appInformationNerd.title')}
    />
  );
};

export default AppInformationNerdScreen;
