import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';

export interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', region: 'Global / Technical' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', region: 'National / Central' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', region: 'Eastern India' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', region: 'Southern India' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', region: 'Southern India' },
];

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vidyut_lang',
    },
  });

export default i18n;
