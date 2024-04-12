import {
  Button,
  ButtonType,
  NavigationHeader,
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Credential } from '../../components/credential/credential';
import { HeaderCloseModalButton } from '../../components/navigation/header-buttons';
import { translate } from '../../i18n';
import {
  CredentialManagementNavigationProp,
  CredentialManagementRouteProp,
} from '../../navigators/credential-management/credential-management-routes';

const StatusCheckResultScreen: FunctionComponent = () => {
  const navigation =
    useNavigation<CredentialManagementNavigationProp<'StatusCheckResult'>>();
  const route = useRoute<CredentialManagementRouteProp<'StatusCheckResult'>>();
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
    <>
      <NavigationHeader
        leftItem={HeaderCloseModalButton}
        modalHandleVisible
        title={translate('credentialUpdate.title')}
      />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={styles.scrollView}
        testID="StatusCheckResultScreen"
      >
        <View style={styles.content}>
          <Typography
            align="center"
            color={colorScheme.text}
            style={styles.subtitle}
          >
            {translate('credentialUpdate.subtitle')}
          </Typography>
          {credentialIds.map((credentialId, index, { length }) => (
            <Credential
              credentialId={credentialId}
              expanded={expandedCredentialId === credentialId}
              key={credentialId}
              lastItem={index === length - 1}
              onHeaderPress={onToggle}
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
      </ScrollView>
    </>
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
  contentContainer: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    marginBottom: 20,
  },
});

export default StatusCheckResultScreen;
