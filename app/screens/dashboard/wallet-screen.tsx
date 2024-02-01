import {
  ActivityIndicator,
  concatTestID,
  FeatureScreen,
  formatDateTime,
  ListView,
  TextAvatar,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { CredentialStateEnum } from '@procivis/react-native-one-core';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { StyleSheet } from 'react-native';

import { NextIcon } from '../../components/icon/common-icon';
import { EmptyIcon, SettingsIcon } from '../../components/icon/wallet-icon';
import {
  useCredentialRevocationCheck,
  useCredentials,
} from '../../hooks/credentials';
import { translate } from '../../i18n';
import { useStores } from '../../models';
import { RootNavigationProp } from '../../navigators/root/root-navigator-routes';
import { reportException } from '../../utils/reporting';
import TabBarAwareContainer from './tab-bar-aware-container';

const WalletScreen: FunctionComponent = observer(() => {
  const colorScheme = useAppColorScheme();
  const navigation = useNavigation<RootNavigationProp>();

  const {
    locale: { locale },
  } = useStores();

  const { data: credentials } = useCredentials();
  const { mutateAsync: checkRevocation } = useCredentialRevocationCheck();

  const revocationCheckPerformed = useRef<boolean>(false);
  useEffect(() => {
    if (!revocationCheckPerformed.current && credentials?.length) {
      revocationCheckPerformed.current = true;
      checkRevocation(credentials.map(({ id }) => id)).catch((e) =>
        reportException(e, 'Revocation check failed'),
      );
    }
  }, [checkRevocation, credentials]);

  const handleWalletSettingsClick = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleCredentialPress = useCallback(
    (_, index: number) => {
      const credentialId = credentials?.[index]?.id;
      if (credentialId) {
        navigation.navigate('CredentialDetail', { credentialId });
      }
    },
    [credentials, navigation],
  );

  return (
    <FeatureScreen
      actionButtons={[
        {
          accessibilityLabel: translate('wallet.settings.title'),
          content: SettingsIcon,
          key: 'settings',
          onPress: handleWalletSettingsClick,
        },
      ]}
      headerBackground={colorScheme.lineargradient}
      key={locale}
      style={{ backgroundColor: colorScheme.background }}
      testID="WalletScreen"
      title={translate('wallet.walletScreen.title')}
    >
      <TabBarAwareContainer>
        {credentials ? (
          <ListView
            emptyListIcon={{
              component: <EmptyIcon color={colorScheme.lightGrey} />,
            }}
            emptyListIconStyle={styles.emptyIcon}
            emptyListSubtitle={translate(
              'wallet.walletScreen.credentialsList.empty.subtitle',
            )}
            emptyListTitle={translate(
              'wallet.walletScreen.credentialsList.empty.title',
            )}
            items={credentials.map((credential) => {
              const testID = concatTestID(
                'WalletScreen.credential',
                credential.id,
              );
              const revoked = credential.state === CredentialStateEnum.REVOKED;
              return {
                icon: {
                  component: (
                    <TextAvatar
                      innerSize={48}
                      produceInitials={true}
                      text={credential.schema.name}
                    />
                  ),
                },
                iconStyle: styles.itemIcon,
                rightAccessory: <NextIcon color={colorScheme.text} />,
                subtitle: revoked
                  ? translate('credentialDetail.log.revoke')
                  : formatDateTime(new Date(credential.issuanceDate)),
                subtitleStyle: revoked
                  ? {
                      color: colorScheme.alertText,
                      testID: concatTestID(testID, 'revoked'),
                    }
                  : undefined,
                testID,
                title: credential.schema.name,
              };
            })}
            onItemSelected={handleCredentialPress}
            title={translate(
              credentials.length
                ? 'wallet.walletScreen.credentialsList.title'
                : 'wallet.walletScreen.credentialsList.title.empty',
              { credentialsCount: credentials.length },
            )}
          />
        ) : (
          <ActivityIndicator />
        )}
      </TabBarAwareContainer>
    </FeatureScreen>
  );
});

const styles = StyleSheet.create({
  emptyIcon: {
    marginBottom: 2,
  },
  itemIcon: {
    borderRadius: 0,
    borderWidth: 0,
  },
});

export default WalletScreen;
