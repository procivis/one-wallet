import { observe } from 'mobx';
import { useCallback, useEffect, useState } from 'react';

import { translate } from '../i18n/translate';
import { useStores } from '../models';

/**
 * Provides {@link translate} functionality which will update when the app language changes
 */
export function useUpdatedTranslate(): typeof translate {
  const { locale } = useStores();
  const [currentLanguage, setCurrentLanguage] = useState(locale.locale);

  useEffect(() => {
    const dispose = observe(locale, 'locale', (event) => {
      if (event.type === 'update') {
        setCurrentLanguage(event.object.get());
      }
    });
    return () => {
      dispose();
    };
  }, [locale]);

  // For the hook to work and update the translate function, we need to generate a new function each time the `currentLanguage` changes.
  // disabling the eslint rule to allow additional dependency
  return useCallback<typeof translate>(
    (...args) => translate(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLanguage],
  );
}
