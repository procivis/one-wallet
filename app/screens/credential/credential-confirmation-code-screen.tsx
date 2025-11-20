import {
  Button,
  ButtonType,
  ScrollViewScreen,
  TextInput,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  KeyStorageSecurity,
  OpenID4VCITxCodeInputMode,
} from '@procivis/react-native-one-core';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, memo, useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { useCapturePrevention } from '../../hooks/capture-prevention';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';

const CredentialConfirmationCodeScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const { walletStore } = useStores();
  const navigation =
    useNavigation<
      IssueCredentialNavigationProp<'CredentialConfirmationCode'>
    >();
  const route =
    useRoute<IssueCredentialRouteProp<'CredentialConfirmationCode'>>();

  useCapturePrevention();

  const {
    invalidCode,
    invitationResult: { txCode: optionalTxCode, keyStorageSecurityLevels = [] },
  } = route.params;
  const txCode = optionalTxCode!;
  const [code, setCode] = useState<string | undefined>(invalidCode);
  const isInputLengthValid = code && code.length === txCode.length;
  const inputError = translate(
    'info.credentialOffer.confirmationCode.input.error',
  );
  const isInvalid = invalidCode && code === invalidCode;
  const isNumericInput = txCode.inputMode === OpenID4VCITxCodeInputMode.NUMERIC;
  const keyboardType = isNumericInput ? 'number-pad' : 'default';
  const submitBtnDisabled = Boolean(!code || !isInputLengthValid);
  const inputPlaceholder = isNumericInput
    ? translate(
        'info.credentialOffer.confirmationCode.input.numberPlaceholder',
        {
          codeLength: txCode.length,
        },
      )
    : translate('info.credentialOffer.confirmationCode.input.textPlaceholder', {
        codeLength: txCode.length,
      });

  const clearValue = useCallback(() => {
    setCode(undefined);
  }, []);

  const handleValueChange = useCallback((text: string) => {
    setCode(text);
  }, []);

  const handleSubmit = useCallback(() => {
    const needsRSESetup =
      keyStorageSecurityLevels?.includes(KeyStorageSecurity.HIGH) &&
      !walletStore.isRSESetup;

    navigation.replace(needsRSESetup ? 'RSEInfo' : 'CredentialOffer', {
      invitationResult: route.params.invitationResult,
    });
  }, [
    navigation,
    route.params.invitationResult,
    keyStorageSecurityLevels,
    walletStore.isRSESetup,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      style={styles.wrapper}
    >
      <ScrollViewScreen
        header={{
          leftItem: (
            <HeaderCloseModalButton testID="CredentialConfirmationCodeScreen.header.close" />
          ),
          static: true,
          title: translate('common.credentialOffering'),
        }}
        modalPresentation
        scrollView={{
          testID: 'CredentialConfirmationCodeScreen.scroll',
        }}
        testID="CredentialConfirmationCodeScreen"
      >
        <View
          style={styles.content}
          testID="CredentialConfirmationCodeScreen.content"
        >
          <View>
            <Typography
              accessibilityRole="header"
              color={colorScheme.text}
              preset="l"
            >
              {translate('common.confirmationCode')}
            </Typography>
            <Typography
              accessibilityRole="header"
              color={colorScheme.text}
              preset="regular"
            >
              {txCode.description}
            </Typography>
            <TextInput
              autoComplete="one-time-code"
              error={isInvalid ? inputError : ''}
              keyboardType={keyboardType}
              label={translate('common.code')}
              onAccessoryPress={clearValue}
              onChangeText={handleValueChange}
              placeholder={inputPlaceholder}
              style={styles.input}
              testID="code.input.value"
              textContentType="oneTimeCode"
              value={code?.toString()}
            />
          </View>

          <Button
            disabled={submitBtnDisabled}
            onPress={handleSubmit}
            testID={'CreateProofSchemaNameScreen.button.submit'}
            title={translate('common.submit')}
            type={submitBtnDisabled ? ButtonType.Secondary : ButtonType.Primary}
          />
        </View>
      </ScrollViewScreen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  input: {
    marginTop: 48,
  },
  wrapper: {
    flex: 1,
  },
});

export default memo(CredentialConfirmationCodeScreen);
