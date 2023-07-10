import { initReactI18next } from 'react-i18next';

import i18next from 'i18next';

import commonDE from './de/common.json';
import forgotPasswordDE from './de/forgotPassword.json';
import loginDE from './de/login.json';
import resetPasswordDE from './de/resetPassword.json';
import commonEN from './en/common.json';
import forgotPasswordEN from './en/forgotPassword.json';
import loginEN from './en/login.json';
import resetPasswordEN from './en/resetPassword.json';

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
      login: loginEN,
      forgotPassword: forgotPasswordEN,
      resetPassword: resetPasswordEN,
      common: commonEN,
    },
    de: {
      login: loginDE,
      forgotPassword: forgotPasswordDE,
      resetPassword: resetPasswordDE,
      common: commonDE,
    },
  },
});
