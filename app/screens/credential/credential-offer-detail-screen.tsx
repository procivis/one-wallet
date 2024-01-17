import {
  ActivityIndicator,
  DetailScreen,
  Typography,
  useAppColorScheme,
} from '@procivis/react-native-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCredentialDetail } from '../../hooks/credentials';
import { translate } from '../../i18n';
import {
  IssueCredentialNavigationProp,
  IssueCredentialRouteProp,
} from '../../navigators/issue-credential/issue-credential-routes';

const Section: FunctionComponent<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.section, { backgroundColor: colorScheme.white }]}>
      {children}
    </View>
  );
};

const DataItem: FunctionComponent<{
  attribute: string;
  last?: boolean;
  value: string;
}> = ({ attribute, value, last }) => {
  const colorScheme = useAppColorScheme();
  return (
    <View
      style={[
        styles.dataItem,
        { borderColor: colorScheme.background },
        last && styles.lastDataItem,
      ]}
    >
      <Typography
        color={colorScheme.textSecondary}
        size="sml"
        style={styles.dataItemLabel}
      >
        {attribute}
      </Typography>
      <Typography
        color={colorScheme.text}
        ellipsizeMode="tail"
        numberOfLines={1}
      >
        {value}
      </Typography>
    </View>
  );
};

const CredentialOfferDetailScreen: FunctionComponent = () => {
  const colorScheme = useAppColorScheme();
  const navigation =
    useNavigation<IssueCredentialNavigationProp<'CredentialOfferDetail'>>();
  const route = useRoute<IssueCredentialRouteProp<'CredentialOfferDetail'>>();

  const { credentialId } = route.params;
  const { data: credential } = useCredentialDetail(credentialId);

  return credential ? (
    <DetailScreen
      onBack={navigation.goBack}
      style={{ backgroundColor: colorScheme.background }}
      testID="CredentialOfferDetailScreen"
      title={translate('credentialOfferDetail.title')}
    >
      <Section>
        <DataItem
          attribute={translate('credentialOfferDetail.did')}
          value={credential.issuerDid ?? ''}
        />
        <DataItem
          attribute={translate('credentialDetail.credential.format')}
          value={credential.schema.format}
        />
        <DataItem
          attribute={translate('credentialDetail.credential.revocationMethod')}
          last={true}
          value={credential.schema.revocationMethod}
        />
      </Section>
    </DetailScreen>
  ) : (
    <ActivityIndicator />
  );
};

const styles = StyleSheet.create({
  dataItem: {
    borderBottomWidth: 1,
    marginTop: 12,
    paddingBottom: 6,
  },
  dataItemLabel: {
    marginBottom: 2,
  },
  lastDataItem: {
    borderBottomWidth: 0,
  },
  section: {
    borderRadius: 20,
    marginBottom: 12,
    padding: 24,
    paddingTop: 12,
  },
});

export default CredentialOfferDetailScreen;
