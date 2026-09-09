import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import as from './as.json';
import hi from './hi.json';
import bn from './bn.json';

const savedLang = localStorage.getItem('mm_language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    as: { translation: as },
    hi: { translation: hi },
    bn: { translation: bn },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
