import {
  Button,
  ButtonType,
  CredentialDetails,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  RootNavigationProp,
  RootRouteProp,
} from '../../navigators/root/root-routes';
import { credentialCardLabels } from '../../utils/credential';

const StatusCheckResultScreen: FunctionComponent = () => {
  const navigation = useNavigation<RootNavigationProp<'StatusCheckResult'>>();
  const route = useRoute<RootRouteProp<'StatusCheckResult'>>();
  const onImagePreview = useCredentialImagePreview();
  const colorScheme = useAppColorScheme();

  const insets = useSafeAreaInsets();

  const credentialIds = route.params.credentialIds;

  const [expandedCredentialId, setExpandedCredentialId] = useState<
    string | undefined
  >(credentialIds[0]);
  const onToggle = useCallback((credentialId?: string) => {
    setExpandedCredentialId((prev) =>
      prev === credentialId ? undefined : credentialId,
    );
  }, []);

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={navigation.goBack}
            testID="StatusCheckResultScreen.header.close"
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        static: true,
        title: translate('common.credentialUpdate'),
      }}
      modalPresentation
      scrollView={{
        alwaysBounceVertical: false,
        testID: 'StatusCheckResultScreen.scroll',
      }}
      testID="StatusCheckResultScreen"
    >
      <View style={styles.content}>
        <Typography
          align="center"
          color={colorScheme.text}
          style={styles.subtitle}
        >
          {translate('info.credentialUpdate.subtitle')}
        </Typography>
        {credentialIds.map((credentialId, index, { length }) => (
          <CredentialDetails
            credentialId={credentialId}
            expanded={expandedCredentialId === credentialId}
            key={credentialId}
            labels={credentialCardLabels()}
            lastItem={index === length - 1}
            onHeaderPress={onToggle}
            onImagePreview={onImagePreview}
          />
        ))}
      </View>
      <View style={[styles.bottom, { marginBottom: insets.bottom }]}>
        <Button
          onPress={navigation.goBack}
          testID="StatusCheckResultScreen.close"
          title={translate('common.close')}
          type={ButtonType.Secondary}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    marginTop: 20,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  subtitle: {
    marginBottom: 20,
  },
});

export default StatusCheckResultScreen;
