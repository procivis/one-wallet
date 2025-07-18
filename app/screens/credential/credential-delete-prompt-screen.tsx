import {
  Button,
  ButtonType,
  concatTestID,
  CredentialDetails,
  HoldButton,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { translate } from '../../i18n';
import {
  DeleteCredentialNavigationProp,
  DeleteCredentialRouteProp,
} from '../../navigators/delete-credential/delete-credential-routes';
import { credentialCardLabels } from '../../utils/credential';

const CredentialDeletePromptScreen: FC = () => {
  const navigation = useNavigation<DeleteCredentialNavigationProp<'Prompt'>>();
  const route = useRoute<DeleteCredentialRouteProp<'Prompt'>>();
  const onImagePreview = useCredentialImagePreview();
  const colorScheme = useAppColorScheme();

  const { credentialId } = route.params;

  const onConfirm = useCallback(() => {
    navigation.replace('Processing', { credentialId });
  }, [navigation, credentialId]);

  return (
    <ScrollViewScreen
      header={{
        leftItem: (
          <HeaderCloseModalButton
            onPress={navigation.goBack}
            testID="CredentialDeletePromptScreen.header.close"
          />
        ),
        modalHandleVisible: Platform.OS === 'ios',
        static: true,
        title: translate('common.credentialDeletion'),
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
          {translate('info.credentialDeletePrompt.subtitle')}
        </Typography>

        <View
          key={credentialId}
          style={styles.credential}
          testID={concatTestID(
            'CredentialDeletePromptScreen.credential',
            credentialId,
          )}
        >
          <CredentialDetails
            credentialId={credentialId}
            headerAccessory={<View />}
            labels={credentialCardLabels()}
            onImagePreview={onImagePreview}
          />
        </View>

        <View style={styles.bottom}>
          <HoldButton
            onFinished={onConfirm}
            style={[styles.mainButton, { backgroundColor: colorScheme.white }]}
            subtitlePrefix={translate('info.holdButton.subtitlePrefix')}
            subtitleSuffix={translate('info.holdButton.subtitleSuffix')}
            testID="CredentialDeletePromptScreen.mainButton"
            title={translate('info.credentialDeletePrompt.confirm.title')}
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
