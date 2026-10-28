import {
  ButtonType,
  LoaderViewState,
  useBlockOSBackNavigation,
} from '@procivis/one-react-native-components';
import { CredentialManager } from '@procivis/react-native-one-core';
import { useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useCallback } from 'react';

import { ProcessingView } from '../../components/common/processing-view';
import { translate, translateError } from '../../i18n';
import { ShareCredentialRouteProp } from '../../navigators/share-credential/share-credential-routes';

const DcApiProofErrorScreen: FunctionComponent = () => {
  const route = useRoute<ShareCredentialRouteProp<'DcApiError'>>();
  const { error } = route.params;

  const closeButtonHandler = useCallback(() => {
    CredentialManager.cancelDcApiRequest();
  }, []);

  useBlockOSBackNavigation(true, () => {
    closeButtonHandler();
    return true;
  });

  return (
    <ProcessingView
      error={error}
      loaderLabel={translateError(
        error,
        translate('proofRequestProcessTitle.warning'),
      )}
      onClose={closeButtonHandler}
      secondaryButton={{
        onPress: closeButtonHandler,
        testID: 'ProofErrorScreen.close',
        title: translate('common.close'),
        type: ButtonType.Secondary,
      }}
      state={LoaderViewState.Warning}
      testID="ProofErrorScreen"
      title={translate('common.shareCredential')}
    />
  );
};

export default DcApiProofErrorScreen;
