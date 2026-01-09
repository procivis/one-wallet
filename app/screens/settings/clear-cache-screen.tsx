import {
  concatTestID,
  HeaderBackButton,
  HoldButton,
  RadioGroup,
  RadioGroupItem,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
  useCacheClear,
} from '@procivis/one-react-native-components';
import { CacheTypeBindingDto } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import { SettingsNavigationProp } from '../../navigators/settings/settings-routes';

enum ClearOptions {
  AllCaches = 'AllCaches',
  RevocationAndTrustData = 'RevocationAndTrustData',
}

const ClearCacheScreen: FunctionComponent = () => {
  const [clearType, setClearType] = useState<ClearOptions>(
    ClearOptions.RevocationAndTrustData,
  );
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<SettingsNavigationProp<'SettingsDashboard'>>();
  const { mutateAsync: clearCache } = useCacheClear();

  const handleSelect = useCallback((item: RadioGroupItem) => {
    setClearType(item.key as ClearOptions);
  }, []);

  const cacheEntriesToClear = useMemo(() => {
    if (clearType === ClearOptions.RevocationAndTrustData) {
      return [
        CacheTypeBindingDto.TRUST_LIST,
        CacheTypeBindingDto.STATUS_LIST_CREDENTIAL,
      ];
    } else {
      return Object.values(CacheTypeBindingDto);
    }
  }, [clearType]);

  const handlePress = useCallback(() => {
    clearCache(cacheEntriesToClear).then(() =>
      navigation.replace('CacheCleared'),
    );
  }, [navigation, clearCache, cacheEntriesToClear]);

  const testID = 'ClearCacheScreen';

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderBackButton testID={concatTestID(testID, 'header.back')} />
        ),
        title: translate('common.clearCache'),
      }}
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID={testID}
    >
      <View style={styles.contentWrapper}>
        <Typography color={colorScheme.text} style={styles.description}>
          {translate('info.clearCacheScreen.description')}
        </Typography>

        <RadioGroup
          containerStyle={styles.radioGroup}
          items={[
            {
              key: ClearOptions.RevocationAndTrustData,
              label: translate(
                'info.settings.profile.clearRevocationAndTrustData',
              ),
              testID: 'ClearRevocationAndTrustData',
            },
            {
              key: ClearOptions.AllCaches,
              label: translate('common.clearAllCaches'),
              testID: `ClearAllCaches`,
            },
          ]}
          onSelected={handleSelect}
          scrollEnabled={false}
          selectedItem={clearType ?? ''}
        />

        <HoldButton
          onFinished={handlePress}
          subtitlePrefix={translate('info.holdButton.subtitlePrefix')}
          subtitleSuffix={translate('info.holdButton.subtitleSuffix')}
          testID={concatTestID(testID, 'mainButton')}
          title={translate('common.clear')}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    marginHorizontal: 20,
  },
  description: {
    opacity: 0.7,
  },
  radioGroup: {
    paddingTop: 24,
  },
});

export default ClearCacheScreen;
