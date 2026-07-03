import {
  ButtonType,
  concatTestID,
  LoaderViewState,
} from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';

import { ProcessingView } from '../../../components/common/processing-view';
import { translate } from '../../../i18n';
import { RootNavigationProp } from '../../../navigators/root/root-routes';

const testID = 'SignErrorScreen';

const SignErrorScreen = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();

  const closeButtonHandler = useCallback(() => {
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);

  const tryAgainButtonHandler = useCallback(() => {
    rootNavigation.popTo('SignDocumentProviderListScreen');
  }, [rootNavigation]);

  return (
    <ProcessingView
      button={{
        onPress: tryAgainButtonHandler,
        testID: concatTestID(testID, 'tryAgain'),
        title: translate('common.tryAgain'),
        type: ButtonType.Primary,
      }}
      loaderLabel={translate('common.documentSigningFailed')}
      onClose={closeButtonHandler}
      state={LoaderViewState.Error}
      testID={testID}
      title={translate('common.signDocument')}
    />
  );
};

export default memo(SignErrorScreen);
