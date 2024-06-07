import {
  Button,
  ButtonType,
  concatTestID,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Credential } from '../../components/credential/credential';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import {
  DeleteCredentialNavigationProp,
  DeleteCredentialRouteProp,
} from '../../navigators/delete-credential/delete-credential-routes';

const LONG_PRESS_TIMEOUT = 3;

const CredentialDeletePromptScreen: FC = () => {
  const navigation = useNavigation<DeleteCredentialNavigationProp<'Prompt'>>();
  const route = useRoute<DeleteCredentialRouteProp<'Prompt'>>();
  const colorScheme = useAppColorScheme();

  const { credentialId } = route.params;

  const onConfirm = useCallback(() => {
    navigation.replace('Processing', { credentialId });
  }, [navigation, credentialId]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: <HeaderCloseModalButton onPress={navigation.goBack} />,
        modalHandleVisible: Platform.OS === 'ios',
        static: true,
        title: translate('credentialDelete.title'),
      }}
      modalPresentation
      scrollView={{
        alwaysBounceVertical: false,
      }}
      testID="CredentialDeletePromptScreen"
    >
      <View
        style={styles.content}
        testID="CredentialDeletePromptScreen.content"
      >
        <Typography
          align="center"
          color={colorScheme.text}
          style={styles.subtitle}
        >
          {translate('credentialDeletePrompt.subtitle')}
        </Typography>

        <View
          key={credentialId}
          style={styles.credential}
          testID={concatTestID(
            'CredentialDeletePromptScreen.credential',
            credentialId,
          )}
        >
          <Credential credentialId={credentialId} headerAccessory={<View />} />
        </View>

        <View style={styles.bottom}>
          <Button
            delayLongPress={LONG_PRESS_TIMEOUT * 1000}
            onLongPress={onConfirm}
            style={styles.mainButton}
            subtitle={translate('credentialDeletePrompt.confirm.subtitle', {
              seconds: LONG_PRESS_TIMEOUT,
            })}
            testID="CredentialDeletePromptScreen.mainButton"
            title={translate('credentialDeletePrompt.confirm.title')}
          />
          <Button
            onPress={navigation.goBack}
            testID="CredentialDeletePromptScreen.close"
            title={translate('common.close')}
            type={ButtonType.Secondary}
          />
        </View>
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
  },
  content: {
    flex: 1,
  },
  credential: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  mainButton: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 12,
  },
});

export default CredentialDeletePromptScreen;
