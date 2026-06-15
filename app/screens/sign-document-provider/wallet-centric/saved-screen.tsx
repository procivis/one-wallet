import { LoaderViewState } from '@procivis/one-react-native-components';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';

import { ProcessingView } from '../../../components/common/processing-view';
import { translate } from '../../../i18n';
import { RootNavigationProp } from '../../../navigators/root/root-routes';

const testID = 'SignDocumentReviewScreen';

const SaveScreen = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();

  const closeButtonHandler = useCallback(() => {
    rootNavigation.popTo('Dashboard', { screen: 'Wallet' });
  }, [rootNavigation]);
  return (
    <ProcessingView
      loaderLabel={translate('common.signedDocumentSaved')}
      onClose={closeButtonHandler}
      state={LoaderViewState.Success}
      testID={testID}
      title={translate('common.signDocument')}
    />
  );
};

export default memo(SaveScreen);
