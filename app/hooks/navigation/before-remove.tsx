import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

import { RootNavigationProp } from '../../navigators/root/root-routes';

export const useBeforeRemove = (callback: () => void) => {
  const rootNavigation = useNavigation<RootNavigationProp<any>>();
  const removed = useRef<boolean>();

  useEffect(() => {
    if (removed.current) {
      return;
    }
    rootNavigation.addListener('beforeRemove', (e) => {
      if (removed.current) {
        return;
      }
      removed.current = true;
      e.preventDefault();
      callback();
      rootNavigation.dispatch(e.data.action);
    });
  }, [callback, rootNavigation]);
};
