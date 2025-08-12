import {
  concatTestID,
  CredentialHeader,
  CredentialHeaderProps,
  PlusIcon,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import React, { FC, memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface CredentialRequestListItemProps extends CredentialHeaderProps {
  handleClick: () => void;
}

const CredentialRequestListItem: FC<CredentialRequestListItemProps> = ({
  handleClick,
  testID,
  ...headerProps
}) => {
  const colorScheme = useAppColorScheme();

  return (
    <TouchableOpacity
      onPress={handleClick}
      style={styles.listItem}
      testID={concatTestID(testID, 'RequestCredentialListItem')}
    >
      <CredentialHeader
        accessory={<PlusIcon color={colorScheme.text} />}
        blur={false}
        style={{ backgroundColor: colorScheme.white }}
        testID={testID}
        {...headerProps}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
});

export default memo(CredentialRequestListItem);
