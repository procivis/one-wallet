import React, { FC } from 'react';
// eslint-disable-next-line no-restricted-imports
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';

const ListPageLoadingIndicator: FC<ActivityIndicatorProps> = (props) => {
  return <ActivityIndicator {...props} />;
};

export default ListPageLoadingIndicator;
