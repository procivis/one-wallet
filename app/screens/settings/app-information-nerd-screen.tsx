import {
  formatDateTimeLocalized,
  NerdModeItemProps,
  NerdModeScreen,
  useMemoAsync,
  useONECore,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { FC } from 'react';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-ultimate-config';

import { useCopyToClipboard } from '../../hooks/clipboard';
import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';
import { attributesLabels } from '../nerd-mode/utils';

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
      attributeKey: translate('common.version'),
      canBeCopied: true,
      highlightedText: appVersion,
    },
    {
      attributeKey: translate('common.flavor'),
      attributeText: appFlavor,
      canBeCopied: true,
    },
  ];

  const { core } = useONECore();
  const coreInfo = useMemoAsync(() => core.getVersion(), [core]);
  const coreVersion = coreInfo ? `v${coreInfo.pipelineId}` : undefined;
  const coreRev = coreInfo?.tag ?? coreInfo?.commit;
  const coreBuildDate = coreInfo
    ? formatDateTimeLocalized(new Date(coreInfo.buildTime))
    : undefined;
  const coreFields: Array<
    Omit<NerdModeItemProps, 'labels' | 'onCopyToClipboard'>
  > = [
    {
      attributeKey: translate('common.version'),
      canBeCopied: true,
      highlightedText: coreVersion,
    },
    {
      attributeKey: translate('common.gitSource'),
      attributeText: coreRev,
      canBeCopied: true,
    },
    {
      attributeKey: translate('common.date'),
      attributeText: coreBuildDate,
      canBeCopied: true,
    },
  ];

  return (
    <NerdModeScreen
      labels={attributesLabels}
      onClose={navigation.goBack}
      onCopyToClipboard={copyToClipboard}
      sections={[
        {
          data: appFields,
          title: translate('common.application'),
        },
        {
          data: coreFields,
          title: translate('common.procivisOneCore'),
        },
      ]}
      testID="AppInformationNerdScreen"
      title={translate('common.moreInformation')}
    />
  );
};

export default AppInformationNerdScreen;
