import {
  ActionModal,
  ActivityIndicator,
  Button,
  ButtonType,
  concatTestID,
  RadioGroup,
  RadioGroupItem,
  useAppColorScheme,
  useCredentialSchemas,
} from '@procivis/one-react-native-components';
import { CredentialSchemaBindingDto } from '@procivis/react-native-one-core';
import { useIsFocused } from '@react-navigation/native';
import React, { FC, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { translate } from '../../i18n';
import ListPageLoadingIndicator from '../list/list-page-loading-indicator';

export interface CredentialSchemaPickerProps {
  onClose: () => void;
  onSelection: (
    credentialSchemaId: CredentialSchemaBindingDto['id'] | undefined,
  ) => void;
  selected?: CredentialSchemaBindingDto['id'];
  testID?: string;
  visible: boolean;
}

export const CredentialSchemaPicker: FC<CredentialSchemaPickerProps> = ({
  selected,
  testID = 'CredentialSchemaPicker',
  visible,
  onSelection,
  onClose,
}) => {
  const isFocused = useIsFocused();
  const colorScheme = useAppColorScheme();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const {
    data: credentialSchemas,
    fetchNextPage: fetchNextSchemasPage,
    hasNextPage: hasNextSchemasPage,
    isLoading,
  } = useCredentialSchemas();

  const handleSchemasEndReached = useCallback(() => {
    if (hasNextSchemasPage) {
      fetchNextSchemasPage().catch(() => {});
    }
  }, [fetchNextSchemasPage, hasNextSchemasPage]);

  const handleCredentialSchemaChange = useCallback(
    (item: RadioGroupItem) => {
      const credentialSchemaId = `${item.key}` || undefined;
      onSelection(credentialSchemaId);
    },
    [onSelection],
  );

  return (
    <ActionModal
      contentStyle={[styles.filterModalContent, { paddingBottom: bottomInset }]}
      testID={testID}
      visible={visible}
    >
      {credentialSchemas ? (
        <RadioGroup
          containerStyle={styles.containerStyle}
          items={[
            {
              key: '',
              label: translate('common.all'),
            },
            ...credentialSchemas.pages.flat().map((credentialSchema) => ({
              key: credentialSchema.id,
              label: credentialSchema.name,
            })),
          ]}
          listFooter={
            isLoading ? (
              <ListPageLoadingIndicator
                color={colorScheme.accent}
                style={styles.footer}
              />
            ) : undefined
          }
          onEndReached={handleSchemasEndReached}
          onSelected={handleCredentialSchemaChange}
          selectedItem={selected ?? ''}
          style={styles.filterGroup}
        />
      ) : (
        <ActivityIndicator animate={isFocused} />
      )}
      <Button
        onPress={onClose}
        style={[styles.closeButton, { borderColor: colorScheme.background }]}
        testID={concatTestID(testID, 'close')}
        title={translate('common.close')}
        type={ButtonType.Secondary}
      />
    </ActionModal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    borderWidth: 1,
  },
  containerStyle: {
    paddingTop: 12,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterModalContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: '45%',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  footer: {
    marginVertical: 16,
  },
});
