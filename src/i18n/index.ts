import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import homeEN from './en/home.json';
import homeDE from './de/home.json';

export const ALLOWED_LOCALES = ['de', 'en'] as const;
type Locale = (typeof ALLOWED_LOCALES)[number];
const DEFAULT_LOCALE = ALLOWED_LOCALES[0];
const detectLocale = () => {
  const localeFromStorage = window.localStorage.getItem('i18nLocale');
  if (localeFromStorage && ALLOWED_LOCALES.includes(localeFromStorage as Locale)) return localeFromStorage;
  if (!('language' in window.navigator)) return DEFAULT_LOCALE;

  const currentLocale = window.navigator.language.split('-')[0] as Locale;
  return ALLOWED_LOCALES.includes(currentLocale) ? currentLocale : DEFAULT_LOCALE;
};

i18next.use(initReactI18next).init({
  lng: detectLocale(),
  resources: {
    en: {
      home: homeEN,
    },
    de: {
      home: homeDE,
    },
  },
});
