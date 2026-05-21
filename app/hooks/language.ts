import i18n from '../i18n/i18n';
import { useStores } from '../models';

export const useCurrentLanguage = () => {
  const {
    locale: { locale },
  } = useStores();
  const language = locale ?? i18n.defaultLocale ?? 'en';
  return language;
};
