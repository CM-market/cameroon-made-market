import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './i18n/locales/en.json';
import fr from './i18n/locales/fr.json';
import { checkDomainOfScale } from 'recharts/types/util/ChartUtils';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en.common,
        auth: en.auth,
        cart: en.cart,
        about: en.about,
        checkout: en.checkout,
        navigation: en.navigation,
        home: en.home,
        // etc.
      },
      fr: {
        common: fr.common,
        auth: fr.auth,
        cart: fr.cart,
        about: fr.about,
        navigation: fr.navigation,
        checkout: fr.checkout,
        home: fr.home,
        // etc.
      }
    },
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    ns: ['common', 'auth', 'cart'], // list all your namespaces here
    defaultNS: 'common', // optionally set default
    interpolation: { escapeValue: false }
  });


export default i18n; 
