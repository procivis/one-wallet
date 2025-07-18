import {
  Button,
  ButtonType,
  concatTestID,
  HeaderBackButton,
  ScrollViewScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';

export const RSEInfoScreen: FC = () => {
  const route = useRoute<IssueCredentialRouteProp<'RSEInfo'>>();
  const navigation = useNavigation<IssueCredentialNavigationProp<'RSEInfo'>>();
  const colorScheme = useAppColorScheme();

  const onContinue = useCallback(
    () => navigation.navigate('Processing', route.params),
    [navigation, route],
  );

  const testID = 'RemoteSecureElementInfoScreen';

  return (
    <ScrollViewScreen
      header={{
        backgroundColor: colorScheme.white,
        leftItem: (
          <HeaderBackButton testID={concatTestID(testID, 'header.back')} />
        ),
        title: translate('info.rse.info.title'),
      }}
      modalPresentation={true}
      scrollView={{
        testID: concatTestID(testID, 'scroll'),
      }}
      style={{ backgroundColor: colorScheme.white }}
      testID={testID}
    >
      <View style={styles.top}>
        <Typography color={colorScheme.text} style={styles.subtitle}>
          {translate('info.rse.info.description', { pinLength: 5 })}
        </Typography>
      </View>

      <View style={styles.bottom}>
        <Button
          onPress={onContinue}
          style={styles.button}
          testID={concatTestID(testID, 'continue')}
          title={translate('common.continue')}
          type={ButtonType.Primary}
        />
      </View>
    </ScrollViewScreen>
  );
};

const styles = StyleSheet.create({
  bottom: {
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 12,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  top: {
    flex: 1,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
});
