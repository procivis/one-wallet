import {
  Button,
  ButtonType,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import {
  ActionModal,
  RadioGroup,
  RadioGroupItem,
} from '@procivis/react-native-components';
import { CredentialSchema } from '@procivis/react-native-one-core';
import React, { FC, useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCredentialSchemas } from '../../hooks/core/credential-schemas';
import { translate } from '../../i18n';

export interface CredentialSchemaPickerProps {
  onClose: () => void;
  onSelection: (credentialSchemaId: CredentialSchema['id'] | undefined) => void;
  selected?: CredentialSchema['id'];
  visible: boolean;
}

export const CredentialSchemaPicker: FC<CredentialSchemaPickerProps> = ({
  visible,
  selected,
  onSelection,
  onClose,
}) => {
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
      fetchNextSchemasPage();
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
      visible={visible}
    >
      {credentialSchemas ? (
        <RadioGroup
          items={[
            {
              key: '',
              label: translate('common.all'),
              style: styles.filterGroupItem,
            },
            ...credentialSchemas.pages.flat().map((credentialSchema) => ({
              key: credentialSchema.id,
              label: credentialSchema.name,
              style: styles.filterGroupItem,
            })),
          ]}
          listFooter={
            isLoading ? (
              <ActivityIndicator
                color={colorScheme.accent}
                style={styles.footer}
              />
            ) : undefined
          }
          onDeselected={handleCredentialSchemaChange}
          onEndReached={handleSchemasEndReached}
          onSelected={handleCredentialSchemaChange}
          selectedItems={selected ? [selected] : ['']}
          staticContent={false}
          style={styles.filterGroup}
        />
      ) : (
        <ActivityIndicator color={colorScheme.accent} />
      )}
      <Button
        onPress={onClose}
        testID="CredentialSchemaPicker.close"
        title={translate('common.close')}
        type={ButtonType.Secondary}
      />
    </ActionModal>
  );
};

const styles = StyleSheet.create({
  filterGroup: {
    marginBottom: 12,
  },
  filterGroupItem: {
    marginVertical: 0,
    paddingTop: 8,
  },
  filterModalContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: '85%',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  footer: {
    marginVertical: 16,
  },
});
