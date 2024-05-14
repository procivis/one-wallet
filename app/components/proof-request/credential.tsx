import { CredentialDetailsCardListItem } from '@procivis/one-react-native-components';
import { PresentationDefinitionRequestedCredential } from '@procivis/react-native-one-core';
import React, { FC } from 'react';

import { useCoreConfig } from '../../hooks/core/core-config';
import { useCredentialDetail } from '../../hooks/core/credentials';
import { useCredentialImagePreview } from '../../hooks/credential-card/image-preview';
import { selectCredentialCardFromCredential } from '../../utils/credential-sharing';

export const Credential: FC<{
  credentialId: string;
  lastItem: boolean;
  onPress?: () => void;
  request: PresentationDefinitionRequestedCredential;
  selected: boolean;
  testID?: string;
}> = ({ testID, credentialId, selected, lastItem, request, onPress }) => {
  const { data: credential } = useCredentialDetail(credentialId);
  const { data: config } = useCoreConfig();

  const onImagePreview = useCredentialImagePreview();

  if (!credential || !config) {
    return null;
  }

  const { card, attributes } = selectCredentialCardFromCredential(
    credential,
    selected,
    request,
    config,
    testID,
  );

  return (
    <CredentialDetailsCardListItem
      attributes={attributes}
      card={{
        ...card,
        onHeaderPress: onPress,
      }}
      expanded={selected}
      lastItem={lastItem}
      onImagePreview={onImagePreview}
    />
  );
};
